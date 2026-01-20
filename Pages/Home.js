import { StatusBar } from 'expo-status-bar';
import { Animated, useColorScheme, ImageBackground, RefreshControl, Keyboard, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, Dimensions, Modal, Platform, Pressable, Image, Alert } from 'react-native';
import { theme } from './color';
import { useRef, useState, useEffect, useCallback, forwardRef } from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import WavyUnderline from './WavyUnderline';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DraxProvider, DraxScrollView, DraxView } from 'react-native-drax';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import Entypo from '@expo/vector-icons/Entypo';
import { useColor } from './ColorContext';
import { useFontSize } from './FontSizeContext';
import { fontTheme } from './font';
import InputBox from './InputBox';
import { LogBox } from 'react-native';
import Octicons from '@expo/vector-icons/Octicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Starlist from './starlist';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

const DisplayWidth = Dimensions.get("window").width
const DisplayHeight = Dimensions.get('window').height

export default function Home() {
    const { color, setColor } = useColor();
    const { fontSize, setFontSize } = useFontSize();

    const [isAuto, setIsAuto] = useState(true);
    const [inputT, setInputT] = useState("");
    const [list, setList] = useState({});
    const [placeNum, setPlaceNum] = useState(0);
    const [modal2, setModal2] = useState(false);
    const [modal3, setModal3] = useState(false);
    const [modal4, setModal4] = useState(false);
    const [text, setText] = useState('');
    const [placeList, setPlaceList] = useState([]);
    const [No, setNo] = useState(false);
    const mainScroll = useRef(null);
    const mainScrollTop = useRef(null);
    const scrollViewRef = useRef({});
    const inputRef = useRef(null);
    const [modalSet, setModalSet] = useState(false);
    const [isloaded, setIsLoaded] = useState(false);
    const [info, setInfo] = useState(false)
    const [tempList, setTempList] = useState({})
    const [tempPlaceList, setTempPlaceList] = useState([])
    const [scrollAble, setScrollAble] = useState(true)
    const [refreshing, setRefreshing] = useState(false);
    const [key, setKey] = useState(Date.now());
    const [change, setChange] = useState(false);
    const systemColorScheme = useColorScheme();  // 시스템 테마 가져오기
    const [starList, setStarList] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current; // 초기값 0 (투명)
    const clear = async () => { await AsyncStorage.clear(); }
    const dragPos = useRef(new Animated.ValueXY()).current;
    useEffect(() => {
        if (starList) {
            // 2. starList가 true가 되면 투명도를 1로 (나타나기)
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400, // 0.4초
                useNativeDriver: true,
            }).start();
        } else {
            // 3. 닫힐 때 다시 0으로 (선택 사항: 모달이 즉시 닫히면 안 보일 수 있음)
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 400, // 0.4초
                useNativeDriver: true,
            }).start();
        }
    }, [starList]);
    useEffect(() => {
        loadUserSetting().then(() => loadList()).then(() => setIsLoaded(true))
    }, [])
    useEffect(() => { loadUserSetting() }, [systemColorScheme])

    useEffect(() => {
        isloaded ? saveList() : null;
    }, [list, placeList])


    useEffect(() => {
        setTimeout(scrollViewRef.current[placeNum]?.scrollTo({ y: 0, animated: false }), 100)
    }, [placeNum])

    const maxPlaceListLength = 6;
    const saveUserSetting = async (color, fontSize) => {
        await AsyncStorage.setItem("@color", color);
        await AsyncStorage.setItem("@textSize", fontSize);
    }
    const saveList = async () => {
        if (Object.keys(list).length > 0 && placeList.length > 0) {
            const stringList = JSON.stringify(list);
            const stringPlaceList = JSON.stringify(placeList);
            await AsyncStorage.setItem("@list", stringList);
            await AsyncStorage.setItem("@placeList", stringPlaceList);
        }
        else null
    }
    const loadList = async () => {
        if (await AsyncStorage.getItem("@list") === null) {
            setList({});
            setPlaceList([]);
        } else {
            setList(JSON.parse(await AsyncStorage.getItem("@list")));
            setPlaceList(JSON.parse(await AsyncStorage.getItem("@placeList")));
        }
    }

    const loadUserSetting = async () => {
        const savedTextSize = await AsyncStorage.getItem("@textSize")
        if (savedTextSize === null) {
            setFontSize("mm");
        } else {
            setFontSize(savedTextSize);
        }

        const savedColor = await AsyncStorage.getItem("@color");
        if (savedColor === null) {
            setIsAuto(true);
            setColor(systemColorScheme)

        } else { setColor(savedColor); setIsAuto(false); }

    }

    const onRefresh = async () => {
        setRefreshing(true);
        setChange(!change);
        setTimeout(async () => {
            await loadList();
            setRefreshing(false);
            setKey(Date.now());
            const newList = Object.entries(list).filter(([key, value]) => value.checked === false)
            setList(Object.fromEntries(newList))
        }, 500)

    };
    const listN = (placeID) => Object.keys(list).filter((key) => list[key].place === placeID);


    const onInitialOK = () => {
        const onPress = async () => {
            await AsyncStorage.clear();
            setPlaceNum(0)
            setList({})
            setPlaceList([])
            setModalSet(false);
            setModal4(false);
        }
        Alert.alert('초기화', '전체 초기화를 실행하시겠습니까?', [
            { text: '아니오', style: 'cancel' },
            { text: '네', style: 'destructive', onPress: onPress }
        ], { cancelable: true })
    }
    const onCheck = (listID) => {
        if (!Keyboard.isVisible()) {
            list[listID].checked = !list[listID].checked;
            const newList = { ...list }
            setList(newList)
        } else {
            Keyboard.dismiss()
        }
    };

    const sortedList = (keyarray) => {
        const newObj = Object.entries(list).filter(([key]) => keyarray ? keyarray.includes(key) : []);
        const sortedArray =
            newObj
                .sort(([idA, itemA], [idB, itemB]) => {
                    // star true인게 위로
                    if (itemA.checked && !itemB.checked) return 1;
                    if (!itemA.checked && itemB.checked) return -1;
                    if (itemA.star && !itemB.star) return -1;
                    if (!itemA.star && itemB.star) return 1;
                    // checked true인게 아래로

                    return 0; // 나머지는 순서 유지
                })

        return sortedArray;
    }

    const onButtonPress = (key) => {
        mainScroll.current?.scrollTo({ x: DisplayWidth * key, animated: false });
        setPlaceNum(key);
    }
    const handleMainScroll = (event) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const page = Math.floor(contentOffsetX / DisplayWidth + 0.5);  // Math.round 대신 Math.floor 사용
        const itemWidth = fontSize === 'll' ? 120 : fontSize === 'mm' ? 100 : 90;
        if (page !== placeNum && page >= 0 && page < placeList.length) {
            setPlaceNum(page);
            mainScrollTop.current?.scrollTo({
                x: page * itemWidth - DisplayWidth / 2 + itemWidth / 2,
                animated: true
            });
        }

    };

    const onSubmit = (text) => {
        if (text !== "") {
            if (tempPlaceList.length < maxPlaceListLength) {
                setTempPlaceList([...tempPlaceList, { id: Date.now(), text: text, edit: false }])
                setText("")

            } else if (tempPlaceList.length >= maxPlaceListLength) {
                setText("");
            } else null;
        } else {
            Keyboard.dismiss()
        }

    }
    const openModalSet = () => {
        setModalSet(!modalSet);
    }
    const addList = () => {
        if (inputT !== "") {
            const newList = { ...list, [Date.now()]: { text: inputT, place: placeList[placeNum].id, checked: false, star: false } }
            setList(newList);
            setInputT("")
            setTimeout(() => {
                const currentItems = listN(placeList[placeNum].id);
                if (currentItems.length > 3) {
                    scrollViewRef.current[placeNum]?.scrollTo({ y: 999999, animated: true });
                }
            }, 100);
        } else { Keyboard.dismiss() }
    }
    const giveStar = (listID) => {
        list[listID].star = !list[listID].star;
        const newList = { ...list }
        setList(newList)
        Keyboard.dismiss()
    };
    const changePlace = (placeID, listID) => {
        const newList = {

            [Date.now()]: {
                ...list[listID],
                place: placeList[placeID].id,
            }, ...list
        };
        delete newList[listID]
        setList(newList);
    };

    const PlaceItem = ({ title, drag, isActive, id }) => {
        const [PEdit, setPEdit] = useState(false);
        const [placeText, setPlaceText] = useState(title);
        const placeEdit = (id) => {
            if (placeText !== '') {
                const newPlaceList = tempPlaceList.map((place) => place.id === id ? { ...place, text: placeText } : place)
                setTempPlaceList(newPlaceList)
                setPEdit(false)
            }
            else { setPEdit(false) }
        }
        const renderRightActions = () => (
            <View style={{ paddingHorizontal: 10, justifyContent: 'center' }}>
                <Pressable onPress={() => placeDelete(id)} hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }} >
                    <Entypo name="trash" size={fontTheme[fontSize].m} color={theme[color].lpoint} />
                </Pressable>
            </View>
        );
        const placeDelete = (id) => {
            const onDletePress = () => {
                const newPlaceList = tempPlaceList.filter((placeList) => placeList.id !== id)
                setTempPlaceList(newPlaceList)
                const newList = Object.values(tempList).filter((list) => list.place !== id)
                setTempList(newList)
                newPlaceList.length < 6 ? (setNo(false)) : null
            }
            onDletePress()

        }
        return (
            <ScaleDecorator>
                <Swipeable renderRightActions={renderRightActions} enabled={!isActive}>
                    <TouchableOpacity style={{ ...styles.headerList, paddingVertical: 8, opacity: isActive ? 0.9 : 1, backgroundColor: isActive ? theme[color].lpoint : theme[color].bg, marginVertical: 2, width: fontSize === 'll' ? 160 : 140, flexDirection: 'row', justifyContent: 'center' }} onPress={() => setPEdit(true)} delayLongPress={500} onLongPress={drag}>
                        {PEdit ? <TextInput autoFocus onChangeText={(a) => { setPlaceText(a) }} maxLength={6} onBlur={() => { placeEdit(id); }} onSubmitEditing={() => { placeEdit(id); }} style={{ ...styles.headerText, fontSize: fontTheme[fontSize].m }} value={placeText} defaultValue={title} ></TextInput> : <Text style={{ ...styles.headerText, fontSize: fontTheme[fontSize].m, }}>{title}</Text>}
                    </TouchableOpacity>
                </Swipeable>
            </ScaleDecorator>
        )
    };
    const ListItem = forwardRef(({ id, text, checked }, ref) => {
        const [LEdit, setLEdit] = useState(false)
        const [listT, setListT] = useState(text)
        const editListItem = () => {
            !checked ?
                setLEdit(true) : null;
        }
        const deleteListItem = () => {
            const newList = Object.entries(list).filter(([key, value]) => key !== id)
            setList(Object.fromEntries(newList))
        }
        const saveListT = () => {
            if (listT === "") {
                const newList = Object.entries(list).filter(([key, value]) => key !== id)
                setList(Object.fromEntries(newList))
            } else {
                const newList = Object.entries(list).map(([key, value]) => key === id ? [key, { ...value, text: listT }] : [key, value]);
                setList(Object.fromEntries(newList))
            }
        }

        return (
            <View ref={ref} key={id} style={{ ...styles.listItem, paddingVertical: 0 }} >
                <View style={{ width: DisplayWidth / 6, flexDirection: 'row-reverse', borderRightWidth: 1, borderColor: theme[color].dgrey, paddingVertical: 4, }}>
                    <TouchableOpacity style={{ marginRight: 8 }} onPress={() => giveStar(id)} hitSlop={{ top: 20, bottom: 20, left: 30, right: 40 }}><FontAwesome6 name={"star-of-life"} size={fontTheme[fontSize].l - 1.5} color={list[id].star ? list[id].checked ? theme[color].dgrey : theme[color].lpoint : theme[color].dgrey} /></TouchableOpacity>
                </View>
                <TouchableOpacity hitSlop={{ top: 5, bottom: 5, left: 10, right: 10 }} activeOpacity={1} onPress={() => { onCheck(id) }} style={{ width: DisplayWidth * 4 / 6, flexDirection: 'row', justifyContent: 'space-between' }}>
                    {!LEdit ?
                        <Text numberOfLines={1} ellipsizeMode='tail' style={{ ...styles.listText, textAlignVertical: 'center', textDecorationLine: checked ? 'line-through' : null, textDecorationStyle: 'double', width: Dimensions.get('window').width * 4 / 6, fontSize: fontTheme[fontSize].l, color: checked ? color === "light" ? theme[color].ddgrey : theme[color].dgrey : theme[color].black, fontWeight: '500' }}>{text}</Text>
                        :
                        <TextInput value={listT} onChangeText={(text) => { setListT(text); }} onSubmitEditing={() => saveListT()} onBlur={() => saveListT()} autoFocus style={{ ...styles.listText, minWidth: DisplayWidth * 4 / 6 }} textAlignVertical='center' />
                    }
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', width: DisplayWidth / 6 }}>
                    <TouchableOpacity style={{ marginRight: 7 }} onPress={() => !LEdit ? editListItem(id) : saveListT()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>{!LEdit ? <Entypo name="pencil" size={20} color={theme[color].dgrey} /> : <Ionicons name="return-down-back" size={20} color={theme[color].dddgrey} />}</TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteListItem(id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}><Entypo name="circle-with-cross" size={20} color={theme[color].dgrey} /></TouchableOpacity>
                </View>
            </View>
        )
    });
    const Modal4 = () => {
        return (

            <View style={{ backgroundColor: theme[color].bg, padding: 20, borderRadius: 15, width: '80%', justifyContent: 'space-evenly', alignItems: 'center' }}>
                <Text style={{ fontSize: fontTheme[fontSize].l, fontWeight: 600, marginBottom: 20, color: theme[color].black }}>설정</Text>

                <View style={{ width: '90%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: fontTheme[fontSize].m, marginVertical: 10, color: theme[color].black }}>글자 크기</Text>
                    <View style={{ flexDirection: 'row', }}>
                        <TouchableOpacity onPress={() => { setFontSize('ss'); saveUserSetting(color, 'ss') }} style={{ ...styles.modalminiButton, backgroundColor: fontSize === 'ss' ? theme[color].lpoint : theme[color].dgrey }}><Text style={{ fontSize: 15, color: theme[color].black }}>Aa</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => { setFontSize('mm'); saveUserSetting(color, 'mm') }} style={{ ...styles.modalminiButton, backgroundColor: fontSize === 'mm' ? theme[color].lpoint : theme[color].dgrey }}><Text style={{ fontSize: 20, color: theme[color].black }}>Aa</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => { setFontSize('ll'); saveUserSetting(color, 'll') }} style={{ ...styles.modalminiButton, backgroundColor: fontSize === 'll' ? theme[color].lpoint : theme[color].dgrey }}><Text style={{ fontSize: 25, color: theme[color].black }}>Aa</Text></TouchableOpacity>
                    </View>
                </View>

                <View style={{ width: '90%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: fontTheme[fontSize].m, marginVertical: 10, color: theme[color].black }}>테마</Text>
                    <View style={{ flexDirection: 'row', }}>
                        <TouchableOpacity
                            onPress={() => { setColor('light'); setIsAuto(false); saveUserSetting('light', fontSize); }}
                            style={{ ...styles.modalminiButton, backgroundColor: !isAuto ? color === 'light' ? theme[color].lpoint : theme[color].dgrey : theme[color].dgrey }}
                        >
                            <Ionicons name="sunny" size={24} color={theme[color].black} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={async () => { setIsAuto(true); await AsyncStorage.removeItem("@color").then(() => loadUserSetting()) }}
                            style={{ ...styles.modalminiButton, backgroundColor: isAuto ? theme[color].lpoint : theme[color].dgrey }}
                        >
                            <View style={{ transform: [{ rotate: '45deg' }] }}>
                                <MaterialCommunityIcons name="circle-slice-4" size={24} color={theme[color].black} />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => { setColor('dark'); setIsAuto(false); saveUserSetting('dark', fontSize) }}
                            style={{ ...styles.modalminiButton, backgroundColor: !isAuto ? color === 'dark' ? theme[color].lpoint : theme[color].dgrey : theme[color].dgrey }}
                        >
                            <Ionicons name="moon" size={20} color={theme[color].black} />
                        </TouchableOpacity>
                    </View>

                </View>
                <View style={{ width: '90%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: fontTheme[fontSize].m, marginVertical: 10, color: theme[color].black }}>전체 초기화</Text>
                    <View style={{ flexDirection: 'row', }}>
                        <TouchableOpacity onPress={() => { onInitialOK(); }} style={{ ...styles.modalminiButton, minWidth: 102 }}><Text style={{ fontSize: fontTheme[fontSize].m, color: theme[color].black }}>실행</Text></TouchableOpacity>
                    </View>
                </View>
                <Text style={{ fontSize: fontTheme[fontSize].s - 2, marginVertical: 10, color: theme[color].lpoint }}>* 어플이 느려지면 초기화 해주세요.</Text>
                <View style={{ flexDirection: 'row', marginTop: 20 }}>
                    <View style={{ marginHorizontal: 5 }}>
                        <Button onPress={() => { setModal4(false); setModalSet(false) }} title="확인" colorT={theme[color].lpoint} />
                    </View>
                </View>
            </View>
        )
    }

    const Button = ({ colorT, title, onPress, onPressOut, onPressIn }) => {

        return (
            <TouchableOpacity onPress={onPress} onPressOut={onPressOut ?? undefined} onPressIn={onPressIn ?? undefined} style={{ borderWidth: 1, borderColor: theme[color].ddgrey, borderRadius: 10, }}>
                <Text style={{ paddingHorizontal: 20, paddingVertical: 10, color: colorT, fontSize: fontTheme[fontSize].m }}>{title}</Text>
            </TouchableOpacity>
        )
    }
    // inputTChange 함수를 useCallback으로 최적화
    const inputTChange = useCallback((text) => {
        setInputT(text);
    }, [fontSize]);



    const onPlaceOK = () => {
        if (tempPlaceList === placeList) { setModal2(false); setModalSet(false); setInfo(false); }
        else (
            Alert.alert("적용", "설정을 완료하시겠습니까?", [
                { text: '취소', style: 'cancel' },
                { text: '확인', style: 'default', onPress: () => { setModal2(false); setModalSet(false); setInfo(false); setPlaceList(tempPlaceList); setList(tempList); setText(""); } }
            ], { cancelable: true }))
    }
    const onPlaceX = () => {
        if (tempPlaceList === placeList) { setModal2(false); setModalSet(false); setInfo(false); }
        else (Alert.alert("수정 중단", "저장하지 않은 변경 사항이 사라집니다. 그래도 나갈까요?", [
            { text: '계속 수정', style: 'cancel' },
            { text: '나가기', style: 'destructive', onPress: () => { setModal2(false); setModalSet(false); setInfo(false); setText(""); } },
        ], { cancelable: true }))
    }
    const currentX = useRef(0); // 드래그 시작 시점의 X 좌표 저장용

    // 1. 드래그 시작 시 위치 고정 함수
    const lockScroll = (index) => {
        currentX.current = index * DisplayWidth; // 현재 페이지의 시작 지점 계산
        setScrollAble(false);
    };
    const styles = StyleSheet.create({
        header: {
            marginTop: 5,
            paddingHorizontal: 10,
            justifyContent: 'center',

        },

        listContainer: {
            flexGrow: 10,
            backgroundColor: 'transparent',
            alignItems: 'center', justifyContent: 'flex-start',
            width: DisplayWidth,
            paddingTop: 10,
            borderColor: theme[color].dgrey,
            borderBottomWidth: 0
        },

        headerList: {
            borderColor: theme[color].ddgrey,
            borderWidth: 1.2,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 20,
            paddingVertical: 10,
            paddingHorizontal: 10,
            marginHorizontal: 3,
            marginVertical: 10,
            maxHeight: fontTheme[fontSize].l + 26,
            minHeight: fontTheme[fontSize].l + 26,

        },
        headerText: {
            padding: 3,
            fontSize: fontTheme[fontSize].l,
            fontWeight: 600,
            color: theme[color].black
        },
        modal: {
            position: 'absolute',
            minHeight: Dimensions.get("window").height * 0.4,
            minWidth: Dimensions.get("window").width * 0.7,
            backgroundColor: theme[color].lpoint, padding: 20, borderRadius: 15, width: '80%', justifyContent: 'space-evenly', alignItems: 'center'
        },
        listItem: {
            paddingVertical: 4,
            borderBottomWidth: 1,
            borderBottomColor: theme[color].dgrey,
            marginVertical: 8,
            flexDirection: "row",
            justifyContent: 'space-between',
            width: Dimensions.get("window").width,
            alignItems: 'center',
            color: theme[color].black
        },
        modalButton: {
            borderRadius: 10, paddingHorizontal: fontSize === "ll" ? 6 : 10, backgroundColor: theme[color].dgrey, marginHorizontal: 3, padding: 10, flexDirection: 'row', alignItems: 'center',
        },
        listText: {
            paddingHorizontal: 10,
            fontSize: fontTheme[fontSize].l,
            color: theme[color].black,
            fontWeight: 500
        },
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        draggable: {
            width: 100,
            height: 100,
            backgroundColor: 'green',
        },
        receiver: {
            width: 100,
            height: 100,
            backgroundColor: 'orange',
        },
        item: {
            padding: 10,
            backgroundColor: '#eee',
            marginVertical: 5,
            alignItems: 'center',
            borderRadius: 10,
        },
        trash: {
            height: 80,
            backgroundColor: '#ffdddd',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 20,
            borderRadius: 10,
        },
        dragging: {
            opacity: 1,
            zIndex: 999,
        },
        modalminiButton: {
            width: 30, height: 30, margin: 3, backgroundColor: theme[color].dgrey, justifyContent: 'center', alignItems: 'center', borderRadius: 5
        }
    })

    return (
        <ImageBackground
            source={color === "light" ? require('../assets/paper.jpg') : require('../assets/paper-dark.jpg')}
            style={{ flex: 1, resizeMode: 'cover', justifyContent: 'center', zIndex: -2, width: '100%' }}
        >
            <View style={{ zIndex: 3, position: 'absolute', bottom: 20, right: 20 }}>
                <Pressable onPress={() => setStarList(!starList)} style={{ zIndex: 4, borderColor: starList ? theme[color].llpoint : theme[color].dgrey, borderWidth: 1, backgroundColor: theme[color].bg, width: 50, height: 50, borderRadius: 35, justifyContent: 'center', alignItems: 'center' }}>
                    <FontAwesome6 name={"star-of-life"} size={25} color={starList ? theme[color].lpoint : theme[color].dgrey} />
                </Pressable>
            </View>
            <View style={{ zIndex: 0, position: 'absolute', bottom: 30, right: 30, }}>
                <Starlist opacity={fadeAnim} list={list} setList={setList} placeList={placeList} onRefresh={onRefresh} refreshing={refreshing} starListOn={starList} setStarList={setStarList} />
            </View>
            <SafeAreaView style={{ flex: 1 }}>
                <Pressable style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} onPress={Keyboard.dismiss} />
                {isloaded ? null : <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: theme[color].bg, zIndex: 10 }}><Image style={{ height: DisplayWidth * 0.4 }} source={require('../assets/splash-icon.png')} /></View>}
                <DraxProvider>
                    <View style={{ flexDirection: 'row', marginBottom: 5, borderBottomWidth: 1, borderColor: theme[color].dgrey }}>
                        <View style={{ flex: 8, backgroundColor: 'transparent' }}>
                            <DraxScrollView ref={mainScrollTop} showsHorizontalScrollIndicator={false} contentContainerStyle={{ ...styles.header, paddingTop: change ? -10 : -8 }} horizontal={true}>
                                {placeList.map((item, index) =>
                                    <DraxView
                                        key={item.id}
                                        onReceiveDragDrop={({ dragged: { payload } }) => {
                                            changePlace(index, payload);
                                        }} receivingStyle={{ backgroundColor: theme[color].llpoint }} style={{ ...styles.headerList, backgroundColor: (placeNum === index) ? theme[color].lpoint : 'transparent' }}>
                                        <Pressable onPress={() => { onButtonPress(index); }}>
                                            <Text style={{ ...styles.headerText, color: (placeNum === index) ? color === "light" ? theme[color].bg : theme[color].dddgrey : theme[color].dddgrey }}>{item.text}</Text>
                                        </Pressable>
                                    </DraxView>)}
                            </DraxScrollView>
                        </View>
                        <View style={{ marginTop: 0, flex: 1, padding: 0, margin: 5, justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableOpacity hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }} style={{ borderRadius: 20, borderWidth: 2, borderColor: placeList.length === 0 ? theme[color].lpoint : 'transparent', padding: 5 }} onPress={() => openModalSet()} >
                                <Ionicons name="ellipsis-horizontal" size={20} color={/* placeList.length === 0 ?  */theme[color].lpoint} /></TouchableOpacity>
                        </View>
                    </View >




                    <Modal visible={modal2} transparent>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={{ flex: 1 }}
                            keyboardVerticalOffset={Platform.OS === 'ios' ? -100 : 0}
                        >
                            <Pressable onPress={Keyboard.dismiss} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000066', }}>
                                <Pressable onPress={Keyboard.dismiss} style={{ backgroundColor: theme[color].bg, borderRadius: 15, paddingHorizontal: 40, paddingVertical: 20, justifyContent: 'center', alignItems: 'center' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                                        <Text style={{ fontSize: fontTheme[fontSize].l, fontWeight: 600, color: theme[color].black, marginLeft: 10, }}>  장 볼 장소</Text>
                                        <TouchableOpacity onPress={() => setInfo(!info)}><MaterialIcons name="info-outline" size={20} color={theme[color].black} style={{ marginBottom: 2, marginTop: 2, marginLeft: 5 }} /></TouchableOpacity>
                                    </View>
                                    {info ? <View style={{ marginHorizontal: -20, justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: fontTheme[fontSize].s, color: theme[color].black }}>1)  장소 버튼을 꾹 누른 후 드래그하여</Text>
                                        <Text style={{ fontSize: fontTheme[fontSize].s, marginBottom: 10, color: theme[color].black }}>순서를 변경할 수 있습니다.</Text>
                                        <Text style={{ fontSize: fontTheme[fontSize].s, marginBottom: 10, color: theme[color].black }}>{"2)  장소는 최대 " + `${maxPlaceListLength}` + "개까지 등록 가능합니다."}</Text></View>
                                        :
                                        <View style={{ backgroundColor: theme[color].llgrey, borderRadius: 20, padding: 10, paddingVertical: 15, minWidth: '70%', justifyContent: 'flex-start', alignItems: 'center', overflow: 'hidden', }}>
                                            {/* <Text style={{ position: 'absolute', top: 5, left: '50%', fontSize: fontTheme[fontSize].s - 5, fontWeight: 300, color: theme[color].black }}>{`${tempPlaceList.length}` + "/" + `${maxPlaceListLength}`}</Text> */}
                                            <Entypo style={{ position: 'absolute', top: '50%', right: 5 }} name="select-arrows" size={fontTheme[fontSize].s} color={theme[color].black} />
                                            <DraggableFlatList
                                                containerStyle={{
                                                    flexGrow: 0,           // 늘어나지 마라
                                                    alignSelf: 'center',   // 👈 핵심: 내 키만큼만 차지하고 중앙에 있어라
                                                    width: '100%',     // 너비는 꽉 채우되
                                                }}
                                                contentContainerStyle={{ flexGrow: 0, marginHorizontal: 10 }}
                                                showsVerticalScrollIndicator={true}
                                                scrollEnabled={true}
                                                data={tempPlaceList}
                                                renderItem={({ item, drag, isActive }) => <PlaceItem title={item.text} id={item.id} drag={drag} isActive={isActive} />}
                                                keyExtractor={item => item.id}
                                                onDragEnd={({ data }) => { setTempPlaceList(data); }}
                                                indicatorStyle='default'
                                                persistentScrollbar={true}
                                            />
                                            {tempPlaceList.length === maxPlaceListLength ? null
                                                :
                                                <View style={{ ...styles.headerList, marginHorizontal: 10, borderStyle: 'dashed', borderColor: theme[color].lpoint, paddingVertical: 6, backgroundColor: theme[color].bg, width: fontSize === 'll' ? 160 : 140, marginVertical: 3, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                                    <TextInput
                                                        placeholder="새 장소 "
                                                        placeholderTextColor={theme[color].black}
                                                        value={text}
                                                        onChangeText={(a) => { setText(a); }}
                                                        style={{
                                                            paddingVertical: 3,
                                                            paddingLeft: 0,  // 중요: 왼쪽 여백 (아이콘과 대칭을 맞추기 위해)
                                                            paddingRight: 0, flex: 1, textAlign: 'center', color: theme[color].black, fontWeight: 600, fontSize: fontTheme[fontSize].m
                                                        }}
                                                        onSubmitEditing={() => onSubmit(text)}
                                                        returnKeyType='go'
                                                        blurOnSubmit={tempPlaceList.length === maxPlaceListLength ? true : false}
                                                        maxLength={6}

                                                    />
                                                    <TouchableOpacity onPress={() => onSubmit(text)}
                                                        style={{ position: 'absolute', right: 10 }} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
                                                        <Ionicons name="return-down-back" size={fontTheme[fontSize].l} color={theme[color].lpoint} />
                                                    </TouchableOpacity>
                                                </View>}
                                        </View>}
                                    {info ?
                                        <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                            <View style={{ marginHorizontal: 5 }}>
                                                <Button colorT={tempPlaceList.length > 0 ? theme[color].lpoint : theme[color].ddgrey} title="돌아가기" onPress={() => { setInfo(false) }} />
                                            </View>
                                        </View> :
                                        <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                            <View style={{ marginHorizontal: 5, marginTop: 10 }}>
                                                <Button colorT={theme[color].ddgrey} title="취소" onPress={() => { onPlaceX(); }} />
                                            </View>
                                            <View style={{ marginHorizontal: 5, marginTop: 10 }}>
                                                <Button colorT={tempPlaceList.length > 0 ? theme[color].lpoint : theme[color].ddgrey} title="저장" onPress={() => { onPlaceOK(); }} />
                                            </View></View>}
                                </Pressable>

                            </Pressable>
                        </KeyboardAvoidingView>

                    </Modal>



                    <Modal visible={modal4} transparent>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme[color].modalbg }}><Modal4 /></View>
                    </Modal>


                    {
                        modalSet ? <View style={{ justifyContent: 'flex-start', flexDirection: 'row-reverse', marginHorizontal: 1, marginBottom: 5, marginRight: 5, alignItems: 'center' }}>
                            <TouchableOpacity title="plus" onPress={() => { setModal2(true); setTempList(list), setTempPlaceList(placeList) }}><View style={{ ...styles.modalButton, borderColor: theme[color].lpoint, borderWidth: placeList.length > 0 ? 0 : 2, backgroundColor: theme[color].dgrey }}><MaterialIcons name="add-location-alt" size={fontTheme[fontSize].m} color={theme[color].black} /><Text style={{ fontSize: fontTheme[fontSize].m, color: theme[color].black }}> 장소 수정</Text></View></TouchableOpacity>
                            <TouchableOpacity title="plus" onPress={() => setModal4(true)}><View style={styles.modalButton}><MaterialIcons name="settings" size={fontTheme[fontSize].m} color={theme[color].black} /><Text style={{ fontSize: fontTheme[fontSize].m, color: theme[color].black }}>  설정</Text></View></TouchableOpacity>
                        </View> : null
                    }
                    <View onStartShouldSetResponderCapture={() => !scrollAble}
                        onMoveShouldSetResponderCapture={() => !scrollAble} style={{ flex: modalSet ? 6.5 : 7, marginTop: 1, borderTopWidth: 1, borderColor: theme[color].dgrey }}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : "height"}
                            style={{ flex: 1 }}
                            keyboardVerticalOffset={Platform.OS === "ios" ? 110 : 20}
                        >
                            <DraxScrollView
                                keyboardShouldPersistTaps="handled"
                                style={{ flex: 1 }}
                                horizontal
                                pagingEnabled
                                onScroll={(e) => {
                                    if (!scrollAble) {
                                        // 드래그 중일 때 억지로 스크롤이 발생하면 저장된 위치로 즉시 복귀
                                        mainScroll.current?.scrollTo({
                                            x: currentX.current,
                                            animated: false, // 애니메이션 없이 즉시 고정
                                        });
                                    }
                                    // 원래의 handleMainScroll 로직 실행
                                    handleMainScroll(e);
                                }}
                                disableIntervalMomentum={true}
                                scrollEventThrottle={10}
                                showsHorizontalScrollIndicator={false}
                                ref={mainScroll}
                                scrollEnabled={scrollAble}
                                snapToInterval={DisplayWidth}
                                snapToAlignment="center"
                                decelerationRate="fast"
                                onScrollBeginDrag={Keyboard.dismiss}
                                scrollThreshold={1}

                            >

                                {placeList.map((item, index) => (

                                    <View key={index} style={{ width: DisplayWidth }}>

                                        <ScrollView key={`${index}-${key}`} ref={(ref) => { scrollViewRef.current[index] = ref }} scrollEventThrottle={1000}
                                            refreshControl={
                                                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme[color].dddgrey} progressViewStyle="bar" progressBackgroundColor="transparent" colors={[theme[color].black, theme[color].dddgrey]} />
                                            }
                                            style={{ flex: 1 }}
                                            contentContainerStyle={{
                                                ...styles.listContainer
                                            }} scrollEnabled={!modal2 && scrollAble}
                                            scrollThreshold={1}
                                            keyboardShouldPersistTaps="handled"
                                            directionalLockEnabled={true}
                                            onScrollBeginDrag={() => { Keyboard.dismiss(); }}
                                        >
                                            {sortedList(listN(item.id)).map(([listID]) =>
                                                <DraxView payload={listID} key={listID} longPressDelay={200}
                                                    disallowInterruption={true}
                                                    draggingStyle={{ opacity: 0.2 }}
                                                    hoverDragReleasedStyle={{ display: 'none' }}

                                                    renderHoverContent={({ viewState }) => {
                                                        return <View style={{ left: viewState?.grabOffset?.x - 60, top: viewState.grabOffset?.y - 30, }}>
                                                            <Text style={{ ...styles.listText, textShadowColor: 'rgba(255, 87, 31,1)', textShadowOffset: { width: 0, height: 10 }, textShadowRadius: 10 }}>{list[listID].text}</Text>
                                                        </View>
                                                    }}
                                                    onDragStart={() => { lockScroll(index); setScrollAble(false); }} onDragEnd={() => setScrollAble(true)} onDragDrop={() => setScrollAble(true)} >
                                                    <ListItem id={listID} text={list[listID].text} checked={list[listID].checked} />

                                                </DraxView>)}
                                            <View style={{ borderBottomColor: theme[color].lpoint, borderBottomWidth: 1, width: DisplayWidth, alignItems: 'center', marginBottom: 10 }}>
                                                <View style={{ flexDirection: 'row', ...styles.listItem, borderBottomWidth: 1, borderBottomColor: theme[color].lpoint, marginBottom: 5, height: fontSize === 'll' ? 34.5 : fontSize === 'mm' ? 31.5 : 28.5, paddingVertical: 0 }}>
                                                    <View style={{ width: DisplayWidth / 6, flexDirection: 'row-reverse', borderRightWidth: 1, borderColor: theme[color].lpoint, paddingVertical: 4 }}>
                                                        <TouchableOpacity style={{ marginRight: 8, }} onPress={() => { inputRef.current.focus(); }} activeOpacity={1}><FontAwesome name="plus" size={20} color={theme[color].lpoint} /></TouchableOpacity>
                                                    </View>
                                                    <TextInput
                                                        ref={inputRef}
                                                        onFocus={() =>
                                                            scrollViewRef.current[placeNum]?.scrollTo({ y: 999999, animated: true })
                                                        }
                                                        style={{ ...styles.listText, left: 0, bottom: 0, width: DisplayWidth * 4 / 6, paddingHorizontal: 10, marginTop: Platform.OS === 'android' ? -20 : 0, marginBottom: Platform.OS === 'android' ? -10 : 0 }} textAlignVertical='center'
                                                        placeholder={'여기서 살 물건을 입력하세요'}
                                                        placeholderTextColor={theme[color].ddgrey}
                                                        value={inputT}
                                                        onChangeText={inputTChange}
                                                        blurOnSubmit={false}
                                                        onSubmitEditing={addList}                                                  // 성능 최적화를 위한 추가 속성들
                                                        maxFontSizeMultiplier={1}
                                                    />
                                                    <TouchableOpacity id='enter1' style={{ width: DisplayWidth / 6 }} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }} onPress={() => addList(text)}                                                    >
                                                        <Ionicons name="return-down-back" size={fontTheme[fontSize].l + 3} color={inputT ? theme[color].dddgrey : theme[color].ddgrey} />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </ScrollView>

                                    </View>
                                ))}
                            </DraxScrollView>
                        </KeyboardAvoidingView>
                    </View >

                </DraxProvider >
                <StatusBar style={color === 'dark' ? 'light' : 'dark'} />
            </SafeAreaView>
        </ImageBackground >
    );
}
