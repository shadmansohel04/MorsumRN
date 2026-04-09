import Avatar, { genConfig, Sex } from "@zamplyy/react-native-nice-avatar";
import { View, StyleSheet, Image, Text } from "react-native";
import { person } from "../../constants/Colors";
import male1 from "../../assets/hair1.png";
import male2 from "../../assets/hair2.png";
import male3 from "../../assets/hair3.png";
import male4 from "../../assets/hair4.png";
import Fontisto from '@expo/vector-icons/Fontisto';

export default function AvatarComp(props) {
    const { attributes, size, streak = 0 } = props;
    const styles = createStyles(size);

    if (
        !attributes ||
        attributes.skinColor == null ||
        attributes.hairColor == null ||
        attributes.hairStyle == null ||
        attributes.eyeStyle == null ||
        attributes.noseStyle == null ||
        attributes.mouthStyle == null ||
        attributes.ear == null ||
        attributes.hatStyle == null ||
        attributes.hatColor == null ||
        attributes.glassesStyle == null ||
        attributes.shirtStyle == null ||
        attributes.shirtColor == null ||
        attributes.bgColor == null
    ) {
        console.warn("Avatar attributes missing or incomplete:", attributes);
        return null;
    }

    const safeGet = (map, index) => map?.[index] ?? Object.values(map)?.[0];

    const config = genConfig({
        faceColor: safeGet(person.skinColor, attributes.skinColor)?.rgb,
        earSize: attributes.ear,
        hairColor: safeGet(person.hairColor, attributes.hairColor)?.rgb,
        hairStyle: safeGet(person.hairStyle, attributes.hairStyle),
        hatStyle: safeGet(person.hatStyle, attributes.hatStyle),
        hatColor: safeGet(person.hatColor, attributes.hatColor),
        eyeStyle: safeGet(person.eyeStyle, attributes.eyeStyle),
        glassesStyle: safeGet(person.glassesStyle, attributes.glassesStyle),
        noseStyle: safeGet(person.noseStyle, attributes.noseStyle),
        mouthStyle: safeGet(person.mouthStyle, attributes.mouthStyle),
        shirtStyle: safeGet(person.shirtStyle, attributes.shirtStyle),
        shirtColor: safeGet(person.shirtColor, attributes.shirtColor),
        bgColor: safeGet(person.bgColor, attributes.bgColor),
        isGradient: true,
        sex: Sex.man
    });

    const renderHair = () => {
        const tintColor = safeGet(person.hairColor, attributes.hairColor)?.rgb;
        const noHat = attributes.hatStyle === 0;

        return (
            <>
                {/* COLOR ON NORMAL MALE */}
                <Image
                    source={male1}
                    style={[
                    styles.hair,
                    styles.hair1,
                    { tintColor, opacity: noHat && attributes.hairStyle === 1 ? 1 : 0 },
                    ]}
                />
                {/* COLOR ON MOHALK */}
                <Image
                    source={male2}
                    style={[
                    styles.hair,
                    styles.hair2,
                    { tintColor, opacity: noHat && attributes.hairStyle === 2 ? 1 : 0 },
                    ]}
                />
                {/* AFRO */}
                <Image
                    source={male3}
                    style={[
                    styles.hair,
                    styles.hair3,
                    { tintColor, opacity: noHat && attributes.hairStyle === 5 ? 1 : 0 },
                    ]}
                />
                {/* SPIKEY */}
                <Image
                    source={male4}
                    style={[
                    styles.hair,
                    styles.hair4,
                    { tintColor, opacity: noHat && attributes.hairStyle === 6 ? 1 : 0 },
                    ]}
                />
            </>
        );
    };


    return (
        <View pointerEvents="none" style={{ width: size, height: size }}>
            {renderHair()}
                {streak > 0 &&
                    <View
                        style={{
                            position: 'absolute',
                            top: '-4%',
                            right: '1%',
                            width: size / 3,
                            height: size / 2.5,
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 6
                        }}
                    >
                        <Fontisto
                            name="fire"
                            size={size / 2.5}
                            color="rgba(247, 187, 69, 1)"
                            style={{
                                position: 'absolute',
                                bottom: '9%'
                            }}
                        />
                        <Text
                            style={{
                                color: 'black',
                                fontSize: size / 4,
                                fontWeight: '800',
                                zIndex: 2,
                                paddingLeft: '3%',
                                paddingRight: '3%'
                            }}
                            numberOfLines={1}
                            adjustsFontSizeToFit={true}
                        >
                            {streak}
                        </Text>
                    </View>


                }
            
            <Avatar size="100%" style={{ marginBottom: 15, zIndex: 1 }} {...config} />
        </View>
    );
}

function createStyles(size) {
    return StyleSheet.create({
        hair:{
            position: 'absolute',
            zIndex: 5
        },
        hair1: {
            top: '5.6%',
            left: '16.6%',
            width: '56%',
            height: '51%',
        },
        hair2: {
            top: '4.9%',
            left: '28.9%',
            width: '29%',
            height: '30.7%',
        },
        hair3: {
            top: '6.0%',
            left: '14.9%',
            width: '66%',
            height: '52%',
        },
        hair4: {
            top: '2%',
            left: '19.9%',
            width: '58%',
            height: '52%',
        }
    });
}
