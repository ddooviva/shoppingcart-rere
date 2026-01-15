import { Animated, View, Text, ScrollView, TouchableOpacity, Pressable } from "react-native"
import { theme } from "./color"
import { useColor } from "./ColorContext"
import { useFontSize } from "./FontSizeContext";
import Ionicons from '@expo/vector-icons/Ionicons';
import { Keyboard } from "react-native";
import { fontTheme } from "./font";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function StarList({ opacity, list, setList, placeList, starListOn, setStarList, onRefresh }) {
    const { color, setColor } = useColor();
    const { fontSize, setFontSize } = useFontSize();

    const starList = Object.entries(list).filter(([key, value]) => value.star === true);
    const onCheck = (id) => {
        if (!Keyboard.isVisible()) {
            list[id].checked = !list[id].checked;
            const newList = { ...list }
            setList(newList)
        } else {
            Keyboard.dismiss()
        }
    };
    const placeIdOrder = placeList.map(place => place.id);

    const sortedList = starList.sort(([idA, itemA], [idB, itemB]) => {
        // checked가 false인 게 위로
        if (itemA.checked && !itemB.checked) return 1;
        if (!itemA.checked && itemB.checked) return -1;

        const indexA = placeIdOrder.indexOf(itemA.place);
        const indexB = placeIdOrder.indexOf(itemB.place);

        const safeIndexA = indexA === -1 ? Infinity : indexA;
        const safeIndexB = indexB === -1 ? Infinity : indexB;

        return safeIndexA - safeIndexB;
    });

    return (
        <>
            {starListOn ? <Pressable onPress={() => { setStarList(false) }} style={{ position: 'absolute', top: -1000, bottom: -1000, left: -1000, right: -1000, zIndex: 2 }}></Pressable> : null}
            <Animated.View style={{ opacity: opacity, position: 'absolute', top: -1000, bottom: -1000, backgroundColor: '#00000066', left: -1000, right: -1000, zIndex: 1 }}></Animated.View>
            <Animated.View style={{ opacity: opacity, maxHeight: 300, width: fontSize === 'll' ? 300 : fontSize === 'mm' ? 250 : 200, zIndex: 2, justifyContent: 'center', alignItems: 'center', backgroundColor: theme[color].bg, borderRadius: 15, paddingVertical: 20 }}>
                {sortedList.length === 0 ? <Text style={{ color: theme[color].dddgrey }}>* 목록이 비었습니다</Text> :

                    <><View style={{ flexDirection: 'row', paddingBottom: 5, alignItems: 'center' }}>
                        <Text style={{ padding: 3, fontSize: fontTheme[fontSize].l, fontWeight: 600, color: theme[color].black }}>  꼭 사야 할 것 </Text>
                    </View>
                        <View style={{ borderBottomWidth: 1, borderColor: theme[color].lpoint, width: '85%' }}></View>
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ maxWidth: '85%', width: '85%', flexDirection: 'column', gap: 5, alignItems: 'flex-start', paddingVertical: 20, paddingBottom: 20 }}>
                            {sortedList.map(([id, item], index) =>
                                <TouchableOpacity onPress={() => onCheck(id)} key={id} style={{ width: '100%', flexDirection: 'row', gap: 5, alignItems: 'center' }} >
                                    <Ionicons name={item.checked ? "checkbox-outline" : "square-outline"} size={24} color={theme[color].dddgrey} />
                                    <Text numberOfLines={1} ellipsizeMode="tail" style={{ flex: 1, color: theme[color].dddgrey, fontWeight: 500, fontSize: fontTheme[fontSize].l }} >{item?.text} </Text>
                                    <Text style={{ color: theme[color].ddgrey, fontSize: fontTheme[fontSize].s, flexShrink: 0 }} >{(placeList.find((value, index) => value.id === item.place))?.text}</Text>
                                </TouchableOpacity>)}
                        </ScrollView></>}
            </Animated.View ></>
    )
}