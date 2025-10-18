import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { theme } from "./color"
import { useColor } from "./ColorContext"
import { useFontSize } from "./FontSizeContext";
import Ionicons from '@expo/vector-icons/Ionicons';
import { Keyboard } from "react-native";
import { fontTheme } from "./font";

export default function StarList({ list, setList, placeList, onRefresh }) {
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
    console.log(placeIdOrder)
    console.log(placeList)

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
    console.log(starList)

    return (
        <View style={{ height: 310, width: 200, zIndex: 2, justifyContent: 'center', alignItems: 'center', backgroundColor: theme[color].bg, borderRadius: 15, paddingVertical: 20 }}>
            <View style={{ flexDirection: 'row', paddingBottom: 10 }}>
                <Text style={{ padding: 3, fontSize: fontTheme[fontSize].l, fontWeight: 600, color: theme[color].black }}>    꼭 사야 할 것</Text>
                <TouchableOpacity onPress={onRefresh}><Ionicons name="refresh-circle-sharp" size={24} color="black" /></TouchableOpacity></View>
            <View style={{ borderBottomWidth: 1, borderColor: theme[color].lpoint, width: '80%' }}></View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ width: '40%', flexDirection: 'column', gap: 5, justifyContent: 'center', alignItems: 'flex-start', paddingTop: 10 }}>
                {sortedList.map(([id, item], index) =>
                    <TouchableOpacity onPress={() => onCheck(id)} key={id} style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                        <Ionicons name={item.checked ? "checkbox-outline" : "square-outline"} size={24} color={theme[color].dddgrey} />
                        <Text style={{ color: theme[color].dddgrey, fontWeight: 500, fontSize: fontTheme[fontSize].m }} >{item?.text} </Text>
                        <Text style={{ color: theme[color].ddgrey, fontSize: fontTheme[fontSize].s }} s>{(placeList.find((value, index) => value.id === item.place))?.text}</Text>
                    </TouchableOpacity>)}
            </ScrollView>
        </View >
    )
}