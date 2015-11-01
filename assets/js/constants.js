var SMV_TICK_LABELS = [
    "-30",
    "-20",
    "-10",
    "0",
    "10",
    "20",
    "30"
];

var ACIDITY_TICK_LABELS = [
    "0",
    "0.5",
    "1.0",
    "1.5",
    "2.0",
    "2.5",
    "3.0"
];

var SMV_TICK_PATHS = [
    "M15,61 H255",
    "M15,84 H255",
    "M15,61 V56",
    "M255,61 V56",
    "M15,84 V90",
    "M55,84 V90",
    "M95,84 V90",
    "M135,84 V90",
    "M175,84 V90",
    "M215,84 V90",
    "M255,84 V90"
];

var ACIDITY_TICK_PATHS = [
    "M15,161 H255",
    "M15,184 H255",
    "M15,161 V156",
    "M255,161 V156",
    "M15,184 V190",
    "M55,184 V190",
    "M95,184 V190",
    "M135,184 V190",
    "M175,184 V190",
    "M215,184 V190",
    "M255,184 V190"
];

var domain = [0, 99];
var SMV_GRADIENT_COLORS = [];
var smvScale = chroma.scale(['#B13F35', '#FFFFCC', '#B404B4']).domain(domain);
smvScale.mode("lab");

var ACIDITY_GRADIENT_COLORS = [];
var acidityColors = chroma.interpolate.bezier(['#5BD75B', '#A51D56']);
var acidityScale = chroma.scale(acidityColors).domain(domain).correctLightness(true);

for (var idx = 0; idx < 100; idx++) {
    SMV_GRADIENT_COLORS.push(smvScale(idx).hex());
    ACIDITY_GRADIENT_COLORS.push(acidityScale(idx).hex());
}

var PREFECTURE_NAME_TO_INDEX = {
    "Okinawa": "0",
    "Kumamoto": "1",
    "Miyazaki": "2",
    "Kagoshima": "3",
    "Oita": "4",
    "Fukuoka": "5",
    "Saga": "6",
    "Nagasaki": "7",
    "Yamaguchi": "8",
    "Hiroshima": "9",
    "Okayama": "10",
    "Shimane": "11",
    "Tottori": "12",
    "Ehime": "13",
    "Kochi": "14",
    "Tokushima": "15",
    "Kagawa": "16",
    "Hyogo": "17",
    "Osaka": "18",
    "Nara": "19",
    "Kyoto": "20",
    "Shiga": "21",
    "Mie": "22",
    "Wakayama": "23",
    "Aichi": "24",
    "Fukui": "25",
    "Gifu": "26",
    "Shizuoka": "27",
    "Yamanashi": "28",
    "Nagano": "29",
    "Toyama": "30",
    "Ishikawa": "31",
    "Niigata": "32",
    "Tokyo": "33",
    "Gunma": "34",
    "Tochigi": "35",
    "Ibaraki": "36",
    "Kanagawa": "37",
    "Saitama": "38",
    "Chiba": "39",
    "Fukushima": "40",
    "Yamagata": "41",
    "Miyagi": "42",
    "Akita": "43",
    "Iwate": "44",
    "Aomori": "45",
    "Hokkaido": "46"
};

var INDEX_TO_PREFECTURE = {
    "0": "Okinawa",
    "1": "Kumamoto",
    "2": "Miyazaki",
    "3": "Kagoshima",
    "4": "Oita",
    "5": "Fukuoka",
    "6": "Saga",
    "7": "Nagasaki",
    "8": "Yamaguchi",
    "9": "Hiroshima",
    "10": "Okayama",
    "11": "Shimane",
    "12": "Tottori",
    "13": "Ehime",
    "14": "Kochi",
    "15": "Tokushima",
    "16": "Kagawa",
    "17": "Hyogo",
    "18": "Osaka",
    "19": "Nara",
    "20": "Kyoto",
    "21": "Shiga",
    "22": "Mie",
    "23": "Wakayama",
    "24": "Aichi",
    "25": "Fukui",
    "26": "Gifu",
    "27": "Shizuoka",
    "28": "Yamanashi",
    "29": "Nagano",
    "30": "Toyama",
    "31": "Ishikawa",
    "32": "Niigata",
    "33": "Tokyo",
    "34": "Gunma",
    "35": "Tochigi",
    "36": "Ibaraki",
    "37": "Kanagawa",
    "38": "Saitama",
    "39": "Chiba",
    "40": "Fukushima",
    "41": "Yamagata",
    "42": "Miyagi",
    "43": "Akita",
    "44": "Iwate",
    "45": "Aomori",
    "46": "Hokkaido"
}

var KYUSHU_REGION = "Kyushu-Okinawa";
var CHUGOKU_REGION = "Chugoku";
var SHIKOKU_REGION = "Shikoku";
var KANSAI_REGION = "Kansai/Kinki";
var CHUBU_REGION = "Chubu";
var KANTO_REGION = "Kanto";
var TOHOKU_REGION = "Tohoku";
var HOKKAIDO_REGION = "Hokkaido";

var PREFECTURE_NAME_TO_REGION_NAME = {
    "Aichi": CHUBU_REGION,
    "Akita": TOHOKU_REGION,
    "Aomori": TOHOKU_REGION,
    "Chiba": KANTO_REGION,
    "Ehime": SHIKOKU_REGION,
    "Fukui": CHUBU_REGION,
    "Fukuoka": KYUSHU_REGION,
    "Fukushima": TOHOKU_REGION,
    "Gifu": CHUBU_REGION,
    "Gunma": KANTO_REGION,
    "Hiroshima": CHUGOKU_REGION,
    "Hokkaido": HOKKAIDO_REGION,
    "Hyogo": KANSAI_REGION,
    "Ibaraki": KANTO_REGION,
    "Ishikawa": CHUBU_REGION,
    "Iwate": TOHOKU_REGION,
    "Kagawa": SHIKOKU_REGION,
    "Kagoshima": KYUSHU_REGION,
    "Kanagawa": KANTO_REGION,
    "Kochi": SHIKOKU_REGION,
    "Kumamoto": KYUSHU_REGION,
    "Kyoto": KANSAI_REGION,
    "Mie": KANSAI_REGION,
    "Miyagi": TOHOKU_REGION,
    "Miyazaki": KYUSHU_REGION,
    "Nagano": CHUBU_REGION,
    "Nagasaki": KYUSHU_REGION,
    "Nara": KANSAI_REGION,
    "Niigata": CHUBU_REGION,
    "Oita": KYUSHU_REGION,
    "Okayama": CHUGOKU_REGION,
    "Okinawa": KYUSHU_REGION,
    "Osaka": KANSAI_REGION,
    "Saga": KYUSHU_REGION,
    "Saitama": KANTO_REGION,
    "Shiga": KANSAI_REGION,
    "Shizuoka": CHUBU_REGION,
    "Shimane": CHUGOKU_REGION,
    "Tochigi": KANTO_REGION,
    "Tokushima": SHIKOKU_REGION,
    "Tokyo": KANTO_REGION,
    "Tottori": CHUGOKU_REGION,
    "Toyama": CHUBU_REGION,
    "Wakayama": KANSAI_REGION,
    "Yamagata": TOHOKU_REGION,
    "Yamaguchi": CHUGOKU_REGION,
    "Yamanashi": CHUBU_REGION
};

var PAGE_SIZE = 1;
var DIMENSION_Y = 750;
var NUMBER_OF_REGIONS = 8;
var MOUSEOVER_EVENT = "mouseover";
var MOUSEOUT_EVENT = "mouseout";
var WHITE_COLOR = '#ffffff';
var BORDER_STROKE_COLOR = '#6e6e6e';
var BORDER_STROKE_WIDTH = '0.4';
var PREFECTURE_NAME_COLOR = '#474747';
var POINTER_LINE_COLOR = '#2e2e2e';
var KYUSHU_REGION_COLOR = '#c2c2c2';
var CHUGOKU_REGION_COLOR = '#efb179';
var SHIKOKU_REGION_COLOR = '#d591f2';
var KANSAI_REGION_COLOR = '#baa8f5';
var CHUBU_REGION_COLOR = '#79efdb';
var KANTO_REGION_COLOR = '#87ef79';
var TOHOKU_REGION_COLOR = '#efe979';
var HOKKAIDO_REGION_COLOR = '#ef7979';
var ANIMATION_DELAY_MILLIS = 200;
var BOUNCE_ANIMATION_DELAY_MILLIS = 600;
var POLYGON_TRANSFORM_SCALE_UP = 's1.2';
var PIE_SLICE_TRANSFORM_SCALE_UP = 's1.07';
var PREFECTURE_TRANSFORM_SCALE_UP = 's1.1';
var HOKKAIDO_PREFECTURE_TRANSFORM_SCALE_UP = 's1.02';
var TRANSFORM_SCALE_NORMAL = 's1.0';
var OKINAWA_TRANSFORM_SCALE_UP = 's1.03';
var CALLUNA_FONT_FAMILY = 'Calluna';
var FERTIGO_FONT_FAMILY = 'Fertigo Pro';
var PALATINO_FONT_FAMILY = 'Palatino';
var MAP_LEGEND_TEXT_ATTRIBUTES = {'font-family': PALATINO_FONT_FAMILY, 'font-weight': 'normal', 'fill': PREFECTURE_NAME_COLOR, 'cursor': 'pointer', 'font-size': 14, 'text-anchor': 'start'};
var MAP_TEXT_ATTRIBUTES = {'font-family': PALATINO_FONT_FAMILY, 'font-weight': 'normal', 'font-style': 'normal', 'fill': PREFECTURE_NAME_COLOR, 'font-size': 11, 'text-anchor': 'center', cursor: 'pointer'};
var MAIN_HEADING_TEXT_ATTRIBUTES = {'font-family': FERTIGO_FONT_FAMILY, 'font-size': 24, 'font-weight': 'bold', 'fill': '#8A360F'};
var SUB_HEADING_TEXT_ATTRIBUTES = {'font-family': FERTIGO_FONT_FAMILY, 'font-size': 18, 'font-weight': 'bold', 'fill': '#8A360F'};
var META_GRADIENT_TEXT_ATTRIBUTES = {"font-family": CALLUNA_FONT_FAMILY, "font-weight": "normal", 'fill': PREFECTURE_NAME_COLOR, "font-size": 12};


var INDEX_TO_REGION_NAME = {
    0: KYUSHU_REGION,
    1: CHUGOKU_REGION,
    2: SHIKOKU_REGION,
    3: KANSAI_REGION,
    4: CHUBU_REGION,
    5: KANTO_REGION,
    6: TOHOKU_REGION,
    7: HOKKAIDO_REGION
};

var REGION_NAME_TO_COLOR = {};
REGION_NAME_TO_COLOR[KYUSHU_REGION] = KYUSHU_REGION_COLOR;
REGION_NAME_TO_COLOR[CHUGOKU_REGION] = CHUGOKU_REGION_COLOR;
REGION_NAME_TO_COLOR[SHIKOKU_REGION] = SHIKOKU_REGION_COLOR;
REGION_NAME_TO_COLOR[KANSAI_REGION] = KANSAI_REGION_COLOR;
REGION_NAME_TO_COLOR[CHUBU_REGION] = CHUBU_REGION_COLOR;
REGION_NAME_TO_COLOR[KANTO_REGION] = KANTO_REGION_COLOR;
REGION_NAME_TO_COLOR[TOHOKU_REGION] = TOHOKU_REGION_COLOR;
REGION_NAME_TO_COLOR[HOKKAIDO_REGION] = HOKKAIDO_REGION_COLOR;

var REGION_NAME_TO_PREFECTURE_INDEX_RANGE = {};
REGION_NAME_TO_PREFECTURE_INDEX_RANGE[KYUSHU_REGION] = [0, 8];
REGION_NAME_TO_PREFECTURE_INDEX_RANGE[CHUGOKU_REGION] = [8, 13];
REGION_NAME_TO_PREFECTURE_INDEX_RANGE[SHIKOKU_REGION] = [13, 17];
REGION_NAME_TO_PREFECTURE_INDEX_RANGE[KANSAI_REGION] = [17, 24];
REGION_NAME_TO_PREFECTURE_INDEX_RANGE[CHUBU_REGION] = [24, 33];
REGION_NAME_TO_PREFECTURE_INDEX_RANGE[KANTO_REGION] = [33, 40];
REGION_NAME_TO_PREFECTURE_INDEX_RANGE[TOHOKU_REGION] = [40, 46];
REGION_NAME_TO_PREFECTURE_INDEX_RANGE[HOKKAIDO_REGION] = [46, 47];

var JAPAN = new Raphael(document.getElementById("japan-map-placeholder"), '80%', DIMENSION_Y);
var PREFECTURE_PATHS = {};
var PREFECTURE_NAMES = {};
