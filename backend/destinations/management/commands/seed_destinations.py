from django.core.management.base import BaseCommand

from destinations.models import Destination
from places.models import Category, Place

CATEGORIES = [
    ('Attractions', 'landmark'),
    ('Restaurants', 'utensils-crossed'),
    ('Hotels', 'bed-double'),
    ('Cafés', 'coffee'),
    ('Shopping', 'shopping-bag'),
    ('Museums', 'building-2'),
    ('Beaches', 'waves'),
    ('Parks', 'trees'),
    ('Temples', 'landmark'),
    ('Historical Places', 'scroll'),
    ('Adventure', 'mountain'),
    ('Nightlife', 'martini'),
]

# Real translations (not machine-garbled placeholders) for every category
# name, keyed the same way as CATEGORY_IMAGES/DESTINATION_TRANSLATIONS below.
CATEGORY_TRANSLATIONS = {
    'Attractions': {'ja': {'name': '観光スポット'}, 'ne': {'name': 'आकर्षणहरू'}, 'hi': {'name': 'आकर्षण'}},
    'Restaurants': {'ja': {'name': 'レストラン'}, 'ne': {'name': 'रेस्टुरेन्टहरू'}, 'hi': {'name': 'रेस्टोरेंट'}},
    'Hotels': {'ja': {'name': 'ホテル'}, 'ne': {'name': 'होटलहरू'}, 'hi': {'name': 'होटल'}},
    'Cafés': {'ja': {'name': 'カフェ'}, 'ne': {'name': 'क्याफेहरू'}, 'hi': {'name': 'कैफे'}},
    'Shopping': {'ja': {'name': 'ショッピング'}, 'ne': {'name': 'किनमेल'}, 'hi': {'name': 'खरीदारी'}},
    'Museums': {'ja': {'name': '博物館'}, 'ne': {'name': 'संग्रहालयहरू'}, 'hi': {'name': 'संग्रहालय'}},
    'Beaches': {'ja': {'name': 'ビーチ'}, 'ne': {'name': 'समुद्री तटहरू'}, 'hi': {'name': 'समुद्र तट'}},
    'Parks': {'ja': {'name': '公園'}, 'ne': {'name': 'पार्कहरू'}, 'hi': {'name': 'पार्क'}},
    'Temples': {'ja': {'name': '寺院'}, 'ne': {'name': 'मन्दिरहरू'}, 'hi': {'name': 'मंदिर'}},
    'Historical Places': {'ja': {'name': '史跡'}, 'ne': {'name': 'ऐतिहासिक स्थलहरू'}, 'hi': {'name': 'ऐतिहासिक स्थल'}},
    'Adventure': {'ja': {'name': 'アドベンチャー'}, 'ne': {'name': 'साहसिक यात्रा'}, 'hi': {'name': 'साहसिक यात्रा'}},
    'Nightlife': {'ja': {'name': 'ナイトライフ'}, 'ne': {'name': 'नाइटलाइफ'}, 'hi': {'name': 'नाइटलाइफ़'}},
}

# Every image below was individually verified against Wikipedia/Wikimedia
# Commons — the article/file was opened, its description checked, and (for
# ambiguous cases) the photo itself was viewed to confirm it actually shows
# the named place, not a lookalike, a different attraction in the same city,
# or a generic city shot reused for a specific landmark. See image_credit
# for the photographer/license; image_source_url is the page it was verified
# against.
IMAGE_SOURCE = 'Wikimedia Commons'

DESTINATION_IMAGES = {
    'Tokyo': {
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Skyscrapers_of_Shinjuku_2009_January.jpg/500px-Skyscrapers_of_Shinjuku_2009_January.jpg',
        'image_source_url': 'https://en.wikipedia.org/wiki/Tokyo',
        'image_credit': 'Morio — CC BY-SA 3.0',
    },
    'Kyoto': {
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Kyoto%2C_Japan_%2849667780482%29.jpg/500px-Kyoto%2C_Japan_%2849667780482%29.jpg',
        'image_source_url': 'https://en.wikipedia.org/wiki/Kyoto',
        'image_credit': 'Nina R from Africa — CC BY 2.0',
    },
    'Osaka': {
        # Deliberately NOT the Osaka Castle photo (used below for the Osaka
        # Castle place card) — a generic skyline shot avoids the two cards
        # showing an identical image.
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Skyline_view_of_Osaka.jpg/500px-Skyline_view_of_Osaka.jpg',
        'image_source_url': 'https://commons.wikimedia.org/wiki/File:Skyline_view_of_Osaka.jpg',
        'image_credit': 'Ian G Shingler — CC BY-SA 4.0',
    },
    'Fukuoka': {
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Fukuoka_Skyline_of_Seaside_Momochi.jpg/500px-Fukuoka_Skyline_of_Seaside_Momochi.jpg',
        'image_source_url': 'https://en.wikipedia.org/wiki/Fukuoka',
        'image_credit': 'Nryate — CC BY-SA 4.0',
    },
    'Paris': {
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg/500px-La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg',
        'image_source_url': 'https://en.wikipedia.org/wiki/Paris',
        'image_credit': 'Yann Caradec from Paris, France — CC BY-SA 2.0',
    },
    'London': {
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/London_Skyline_%28125508655%29.jpeg/500px-London_Skyline_%28125508655%29.jpeg',
        'image_source_url': 'https://en.wikipedia.org/wiki/London',
        'image_credit': 'Ilya Grigorik — CC BY-SA 3.0',
    },
    'New York': {
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg/500px-View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg',
        'image_source_url': 'https://en.wikipedia.org/wiki/New_York_City',
        'image_credit': 'Dllu — CC BY-SA 4.0',
    },
    'Dubai': {
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Dubai_Skyline_2016.jpg/500px-Dubai_Skyline_2016.jpg',
        'image_source_url': 'https://commons.wikimedia.org/wiki/File:Dubai_Skyline_2016.jpg',
        'image_credit': 'Tonenight — CC BY-SA 4.0',
    },
    'Kathmandu': {
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Kathmandu-Durbar_Square-06-Mahavishnu-Kuh-Vishnu-Pratapamalla-Jagannath-2007-gje.jpg/500px-Kathmandu-Durbar_Square-06-Mahavishnu-Kuh-Vishnu-Pratapamalla-Jagannath-2007-gje.jpg',
        'image_source_url': 'https://en.wikipedia.org/wiki/Kathmandu',
        'image_credit': 'Gerd Eichmann — CC BY-SA 4.0',
    },
    'Sydney': {
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Sydney_Opera_House_and_Harbour_Bridge_Dusk_%282%29_2019-06-21.jpg/500px-Sydney_Opera_House_and_Harbour_Bridge_Dusk_%282%29_2019-06-21.jpg',
        'image_source_url': 'https://en.wikipedia.org/wiki/Sydney',
        'image_credit': 'Benh LIEU SONG (Flickr) — CC BY-SA 4.0',
    },
}

DESTINATION_TRANSLATIONS = {
    'Tokyo': {
        'ja': {'name': '東京', 'description': '古代の寺院と未来的な高層ビルが融合する、ネオンきらめく日本の首都。'},
        'ne': {'name': 'टोकियो', 'description': 'प्राचीन मन्दिरहरू र भविष्यवादी गगनचुम्बी भवनहरू मिश्रित जापानको नियोन-उज्यालो राजधानी।'},
        'hi': {'name': 'टोक्यो', 'description': 'प्राचीन मंदिरों और भविष्यवादी गगनचुंबी इमारतों का मिश्रण, जापान की नियॉन-रोशनी वाली राजधानी।'},
    },
    'Kyoto': {
        'ja': {'name': '京都', 'description': '日本の文化の中心地 — 数千の寺院、神社、歴史的な芸妓の街並み。'},
        'ne': {'name': 'क्योतो', 'description': 'जापानको सांस्कृतिक हृदय — हजारौं मन्दिरहरू, शिन्तो मन्दिरहरू, र ऐतिहासिक गेइशा क्षेत्रहरू।'},
        'hi': {'name': 'क्योटो', 'description': 'जापान का सांस्कृतिक हृदय — हज़ारों मंदिर, तीर्थस्थल और ऐतिहासिक गेशा क्षेत्र।'},
    },
    'Osaka': {
        'ja': {'name': '大阪', 'description': '屋台グルメ、ナイトライフ、大阪城で知られる、食通の楽園。'},
        'ne': {'name': 'ओसाका', 'description': 'स्ट्रिट फूड, नाइटलाइफ र ओसाका किल्लाका लागि प्रसिद्ध खानाप्रेमीहरूको स्वर्ग।'},
        'hi': {'name': 'ओसाका', 'description': 'स्ट्रीट फूड, नाइटलाइफ़ और ओसाका कैसल के लिए मशहूर, खाने के शौकीनों का स्वर्ग।'},
    },
    'Fukuoka': {
        'ja': {'name': '福岡', 'description': 'とんこつラーメン、ビーチ、自然へのアクセスの良さで知られる、のんびりとした港町。'},
        'ne': {'name': 'फुकुओका', 'description': 'टोन्कोत्सु रामेन, समुद्री तट र प्रकृतिसम्म सजिलो पहुँचका लागि प्रसिद्ध शान्त तटीय सहर।'},
        'hi': {'name': 'फुकुओका', 'description': 'टोंकोत्सु रामेन, समुद्र तटों और प्रकृति तक आसान पहुंच के लिए प्रसिद्ध एक निश्चिंत तटीय शहर।'},
    },
    'Paris': {
        'ja': {'name': 'パリ', 'description': '光の都 — 象徴的なランドマーク、世界クラスの芸術、忘れられない美食。'},
        'ne': {'name': 'पेरिस', 'description': 'प्रकाशको सहर — प्रतिष्ठित स्मारकहरू, विश्वस्तरीय कला, र अविस्मरणीय परिकारहरू।'},
        'hi': {'name': 'पेरिस', 'description': 'रोशनी का शहर — प्रतिष्ठित स्मारक, विश्व स्तरीय कला और अविस्मरणीय व्यंजन।'},
    },
    'London': {
        'ja': {'name': 'ロンドン', 'description': '博物館、王室ゆかりの名所、多様な文化にあふれる歴史ある世界都市。'},
        'ne': {'name': 'लन्डन', 'description': 'संग्रहालयहरू, शाही स्मारकहरू, र विविध संस्कृतिले भरिपूर्ण ऐतिहासिक विश्व राजधानी।'},
        'hi': {'name': 'लंदन', 'description': 'संग्रहालयों, शाही स्मारकों और विविध संस्कृति से भरपूर एक ऐतिहासिक वैश्विक राजधानी।'},
    },
    'New York': {
        'ja': {'name': 'ニューヨーク', 'description': '眠らない街 — 象徴的なスカイライン、ブロードウェイ、絶え間ないエネルギー。'},
        'ne': {'name': 'न्यूयोर्क', 'description': 'कहिल्यै नसुत्ने सहर — प्रतिष्ठित स्काइलाइन, ब्रोडवे, र निरन्तर ऊर्जा।'},
        'hi': {'name': 'न्यूयॉर्क', 'description': 'कभी न सोने वाला शहर — प्रतिष्ठित स्काइलाइन, ब्रॉडवे और अनवरत ऊर्जा।'},
    },
    'Dubai': {
        'ja': {'name': 'ドバイ', 'description': '記録的な高層ビルと高級ショッピングが揃う、未来的な砂漠の大都市。'},
        'ne': {'name': 'दुबई', 'description': 'रेकर्ड-ब्रेकिङ गगनचुम्बी भवनहरू र विलासी किनमेलको भविष्यवादी मरुभूमि महानगर।'},
        'hi': {'name': 'दुबई', 'description': 'रिकॉर्ड तोड़ गगनचुंबी इमारतों और लक्जरी शॉपिंग वाला एक भविष्यवादी रेगिस्तानी महानगर।'},
    },
    'Kathmandu': {
        'ja': {'name': 'カトマンズ', 'description': '古代寺院と山岳アドベンチャーにあふれる、ヒマラヤへの玄関口。'},
        'ne': {'name': 'काठमाडौं', 'description': 'प्राचीन मन्दिरहरू र पहाडी साहसिक यात्राले भरिपूर्ण हिमालको प्रवेशद्वार।'},
        'hi': {'name': 'काठमांडू', 'description': 'प्राचीन मंदिरों और पर्वतीय रोमांच से भरपूर, हिमालय का प्रवेश द्वार।'},
    },
    'Sydney': {
        'ja': {'name': 'シドニー', 'description': 'オペラハウス、ビーチ、アウトドアなライフスタイルで有名な美しい港湾都市。'},
        'ne': {'name': 'सिड्नी', 'description': 'आफ्नो ओपेरा हाउस, समुद्री तटहरू, र आउटडोर जीवनशैलीका लागि प्रसिद्ध मनमोहक बन्दरगाह सहर।'},
        'hi': {'name': 'सिडनी', 'description': 'अपने ओपेरा हाउस, समुद्र तटों और आउटडोर जीवनशैली के लिए प्रसिद्ध एक शानदार बंदरगाह शहर।'},
    },
}

PLACE_TRANSLATIONS = {
    'Senso-ji Temple': {
        'ja': {'name': '浅草寺', 'description': '歴史ある浅草にある古代仏教寺院。'},
        'ne': {'name': 'सेन्सोजी मन्दिर', 'description': 'ऐतिहासिक असाकुसामा रहेको प्राचीन बौद्ध मन्दिर।'},
        'hi': {'name': 'सेंसोजी मंदिर', 'description': 'ऐतिहासिक असाकुसा में एक प्राचीन बौद्ध मंदिर।'},
    },
    'Tokyo Skytree': {
        'ja': {'name': '東京スカイツリー', 'description': 'パノラマの街並みを一望できる象徴的な電波塔。'},
        'ne': {'name': 'टोकियो स्काइट्री', 'description': 'सहरको विहङ्गम दृश्य दिने प्रतिष्ठित प्रसारण टावर।'},
        'hi': {'name': 'टोक्यो स्काईट्री', 'description': 'शहर के विहंगम दृश्यों वाला एक प्रतिष्ठित प्रसारण टावर।'},
    },
    'Fushimi Inari Shrine': {
        'ja': {'name': '伏見稲荷大社', 'description': '数千本の朱色の鳥居で有名な神社。'},
        'ne': {'name': 'फुशिमी इनारी शिन्तो मन्दिर', 'description': 'हजारौं सिन्दुरे तोरी ढोकाहरू भएको प्रसिद्ध मन्दिर।'},
        'hi': {'name': 'फुशिमी इनारी श्राइन', 'description': 'हज़ारों लाल तोरी द्वारों वाला एक प्रसिद्ध तीर्थस्थल।'},
    },
    'Arashiyama Bamboo Grove': {
        'ja': {'name': '嵐山竹林', 'description': '静寂に包まれた、そびえ立つ竹林の小道。'},
        'ne': {'name': 'अरासियामा बाँस वन', 'description': 'शान्त, अग्लो बाँसको जंगल भएको मार्ग।'},
        'hi': {'name': 'अराशियामा बैंबू ग्रोव', 'description': 'एक शांत, ऊंचे बांस के जंगल का रास्ता।'},
    },
    'Osaka Castle': {
        'ja': {'name': '大阪城', 'description': '日本を代表する歴史的名所のひとつ。'},
        'ne': {'name': 'ओसाका किल्ला', 'description': 'जापानका सबैभन्दा प्रतिष्ठित ऐतिहासिक स्मारकहरू मध्ये एक।'},
        'hi': {'name': 'ओसाका कैसल', 'description': 'जापान के सबसे प्रतिष्ठित ऐतिहासिक स्थलों में से एक।'},
    },
    'Dotonbori': {
        'ja': {'name': '道頓堀', 'description': 'ネオンが輝くグルメと娯楽の街。'},
        'ne': {'name': 'दोतोन्बोरी', 'description': 'नियोन बत्तीले सजिएको भोजन र मनोरञ्जन क्षेत्र।'},
        'hi': {'name': 'दोतोनबोरी', 'description': 'नियॉन रोशनी से जगमगाता भोजन और मनोरंजन क्षेत्र।'},
    },
    'Ohori Park': {
        'ja': {'name': '大濠公園', 'description': '市の中心部にある、湖畔の美しい公園。'},
        'ne': {'name': 'ओहोरी पार्क', 'description': 'सहरको हृदयमा रहेको सुरम्य ताल किनारको पार्क।'},
        'hi': {'name': 'ओहोरी पार्क', 'description': 'शहर के केंद्र में स्थित एक सुरम्य झील किनारे का पार्क।'},
    },
    'Yatai Food Stalls': {
        'ja': {'name': '屋台', 'description': '地元の名物料理を提供する屋外の屋台。'},
        'ne': {'name': 'यातेइ फूड स्टलहरू', 'description': 'स्थानीय परिकारहरू पस्कने खुला हावाका सडक फूड स्टलहरू।'},
        'hi': {'name': 'यातेई फूड स्टॉल्स', 'description': 'स्थानीय व्यंजन परोसने वाले खुले हवा के स्ट्रीट फूड स्टॉल।'},
    },
    'Eiffel Tower': {
        'ja': {'name': 'エッフェル塔', 'description': 'シャン・ド・マルスにある世界的に有名な鉄骨タワー。'},
        'ne': {'name': 'एफिल टावर', 'description': 'च्याम्प डे मार्समा रहेको विश्वप्रसिद्ध फलामे जालीदार टावर।'},
        'hi': {'name': 'एफिल टावर', 'description': 'शैंप डे मार्स पर स्थित विश्व प्रसिद्ध लोहे की जालीदार मीनार।'},
    },
    'Louvre Museum': {
        'ja': {'name': 'ルーヴル美術館', 'description': 'モナ・リザを所蔵する世界最大の美術館。'},
        'ne': {'name': 'लुभ्र संग्रहालय', 'description': 'मोना लिसाको घर, विश्वको सबैभन्दा ठूलो कला संग्रहालय।'},
        'hi': {'name': 'लूव्र संग्रहालय', 'description': 'मोना लिसा का घर, विश्व का सबसे बड़ा कला संग्रहालय।'},
    },
    'British Museum': {
        'ja': {'name': '大英博物館', 'description': '人類の歴史と文化を紹介する世界的に有名な博物館。'},
        'ne': {'name': 'ब्रिटिश संग्रहालय', 'description': 'मानव इतिहास र संस्कृतिको विश्वप्रसिद्ध संग्रहालय।'},
        'hi': {'name': 'ब्रिटिश संग्रहालय', 'description': 'मानव इतिहास और संस्कृति का विश्व-प्रसिद्ध संग्रहालय।'},
    },
    'Tower Bridge': {
        'ja': {'name': 'タワーブリッジ', 'description': 'テムズ川に架かる象徴的なヴィクトリア朝の跳ね橋。'},
        'ne': {'name': 'टावर ब्रिज', 'description': 'टेम्स नदीमाथिको प्रतिष्ठित भिक्टोरियन बास्कुल पुल।'},
        'hi': {'name': 'टावर ब्रिज', 'description': 'टेम्स नदी पर बना प्रतिष्ठित विक्टोरियन बैस्कुल पुल।'},
    },
    'Central Park': {
        'ja': {'name': 'セントラルパーク', 'description': 'マンハッタンの中心に広がる都市公園。'},
        'ne': {'name': 'सेन्ट्रल पार्क', 'description': 'म्यानह्याट्नको बीचमा फैलिएको विशाल सहरी पार्क।'},
        'hi': {'name': 'सेंट्रल पार्क', 'description': 'मैनहट्टन के बीचोबीच फैला विशाल शहरी पार्क।'},
    },
    'Times Square': {
        'ja': {'name': 'タイムズスクエア', 'description': '巨大広告で輝く、ニューヨークの中心地。'},
        'ne': {'name': 'टाइम्स स्क्वायर', 'description': 'न्यूयोर्कको चम्किलो, विज्ञापन-बोर्डले उज्यालो हृदयस्थल।'},
        'hi': {'name': 'टाइम्स स्क्वायर', 'description': 'न्यूयॉर्क का चमकदार, विज्ञापन-रोशनी से जगमगाता केंद्र।'},
    },
    'Burj Khalifa': {
        'ja': {'name': 'ブルジュ・ハリファ', 'description': '展望デッキを備えた世界一高い建物。'},
        'ne': {'name': 'बुर्ज खलिफा', 'description': 'अवलोकन डेकसहितको विश्वकै अग्लो भवन।'},
        'hi': {'name': 'बुर्ज ख़लीफ़ा', 'description': 'एक अवलोकन डेक वाली दुनिया की सबसे ऊंची इमारत।'},
    },
    'Dubai Mall': {
        'ja': {'name': 'ドバイ・モール', 'description': '地球上で最大級のショッピングモールのひとつ。'},
        'ne': {'name': 'दुबई मल', 'description': 'पृथ्वीका सबैभन्दा ठूला किनमेल मलहरू मध्ये एक।'},
        'hi': {'name': 'दुबई मॉल', 'description': 'पृथ्वी पर सबसे बड़े शॉपिंग मॉल में से एक।'},
    },
    'Swayambhunath Stupa': {
        'ja': {'name': 'スワヤンブナート', 'description': 'カトマンズ盆地を見下ろす、丘の上の古代仏塔。'},
        'ne': {'name': 'स्वयम्भूनाथ स्तूप', 'description': 'काठमाडौं उपत्यका नियाल्ने पहाडी टाकुरामा रहेको प्राचीन स्तूप।'},
        'hi': {'name': 'स्वयंभूनाथ स्तूप', 'description': 'काठमांडू घाटी को निहारता एक प्राचीन पहाड़ी स्तूप।'},
    },
    'Thamel Market': {
        'ja': {'name': 'タメル市場', 'description': '商店、カフェ、トレッキング用品店が並ぶ賑やかな観光街。'},
        'ne': {'name': 'थमेल बजार', 'description': 'पसल, क्याफे, र ट्रेकिङ सामग्रीले भरिपूर्ण चहलपहल भएको पर्यटकीय क्षेत्र।'},
        'hi': {'name': 'थमेल मार्केट', 'description': 'दुकानों, कैफे और ट्रैकिंग गियर से भरा हलचल भरा पर्यटक क्षेत्र।'},
    },
    'Sydney Opera House': {
        'ja': {'name': 'シドニー・オペラハウス', 'description': '港に佇む世界的に有名な舞台芸術の殿堂。'},
        'ne': {'name': 'सिड्नी ओपेरा हाउस', 'description': 'बन्दरगाहमा रहेको विश्वप्रसिद्ध परफर्मिङ आर्ट्स स्थल।'},
        'hi': {'name': 'सिडनी ओपेरा हाउस', 'description': 'बंदरगाह पर स्थित विश्व प्रसिद्ध प्रदर्शन कला स्थल।'},
    },
    'Bondi Beach': {
        'ja': {'name': 'ボンダイビーチ', 'description': 'シドニーで最も象徴的なビーチと海岸沿いの散策路。'},
        'ne': {'name': 'बोन्डाई बिच', 'description': 'सिड्नीको सबैभन्दा प्रतिष्ठित समुद्री तट र तटीय पैदल मार्ग।'},
        'hi': {'name': 'बॉन्डाई बीच', 'description': 'सिडनी का सबसे प्रतिष्ठित समुद्र तट और तटीय सैरगाह।'},
    },
}

PLACE_IMAGES = {
    'Senso-ji Temple': {
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Sensoji_2023.jpg/500px-Sensoji_2023.jpg',
        'image_source_url': 'https://en.wikipedia.org/wiki/Sens%C5%8D-ji',
        'image_credit': 'Akonnchiroll — CC0',
    },
    'Tokyo Skytree': {
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Tokyo_Skytree_2014_%E2%85%A2.jpg/500px-Tokyo_Skytree_2014_%E2%85%A2.jpg',
        'image_source_url': 'https://en.wikipedia.org/wiki/Tokyo_Skytree',
        'image_credit': 'Kakidai — CC BY-SA 3.0',
    },
    'Fushimi Inari Shrine': {
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Torii_path_with_lantern_at_Fushimi_Inari_Taisha_Shrine%2C_Kyoto%2C_Japan.jpg/500px-Torii_path_with_lantern_at_Fushimi_Inari_Taisha_Shrine%2C_Kyoto%2C_Japan.jpg',
        'image_source_url': 'https://en.wikipedia.org/wiki/Fushimi_Inari-taisha',
        'image_credit': 'Basile Morin — CC BY-SA 4.0',
    },
    'Arashiyama Bamboo Grove': {
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Arashiyama_Bamboo_Grove.jpg/500px-Arashiyama_Bamboo_Grove.jpg',
        'image_source_url': 'https://commons.wikimedia.org/wiki/File:Arashiyama_Bamboo_Grove.jpg',
        'image_credit': 'Mitchwandrew — CC BY 4.0',
    },
    'Osaka Castle': {
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Osaka_Castle_03bs3200.jpg/500px-Osaka_Castle_03bs3200.jpg',
        'image_source_url': 'https://en.wikipedia.org/wiki/Osaka_Castle',
        'image_credit': '663highland — CC BY 2.5',
    },
    'Dotonbori': {
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Dotonbori%2C_Osaka%2C_at_night%2C_November_2016.jpg/500px-Dotonbori%2C_Osaka%2C_at_night%2C_November_2016.jpg',
        'image_source_url': 'https://commons.wikimedia.org/wiki/File:Dotonbori,_Osaka,_at_night,_November_2016.jpg',
        'image_credit': 'Martin Falbisoner — CC BY-SA 4.0',
    },
    'Ohori Park': {
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/%E5%A4%A7%E6%BF%A0%E5%85%AC%E5%9C%92_%283360365578%29.jpg/500px-%E5%A4%A7%E6%BF%A0%E5%85%AC%E5%9C%92_%283360365578%29.jpg',
        'image_source_url': 'https://en.wikipedia.org/wiki/%C5%8Chori_Park',
        'image_credit': 'Tzuhsun Hsu from Taipei, Taiwan — CC BY-SA 2.0',
    },
    'Yatai Food Stalls': {
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Yatai_beside_Naka-gawa%2C_Fukuoka%2C_Japan_-_20110525-01.jpg/500px-Yatai_beside_Naka-gawa%2C_Fukuoka%2C_Japan_-_20110525-01.jpg',
        'image_source_url': 'https://commons.wikimedia.org/wiki/File:Yatai_beside_Naka-gawa,_Fukuoka,_Japan_-_20110525-01.jpg',
        'image_credit': 'Jacklee — CC BY-SA 3.0',
    },
    'Eiffel Tower': {
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg/500px-Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg',
        'image_source_url': 'https://en.wikipedia.org/wiki/Eiffel_Tower',
        'image_credit': 'Benh LIEU SONG — Public domain',
    },
    'Louvre Museum': {
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Louvre_Museum_Wikimedia_Commons.jpg/500px-Louvre_Museum_Wikimedia_Commons.jpg',
        'image_source_url': 'https://en.wikipedia.org/wiki/Louvre',
        'image_credit': 'Benh LIEU SONG (Flickr) — CC BY-SA 3.0',
    },
    'British Museum': {
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/British_Museum_%28aerial%29.jpg/500px-British_Museum_%28aerial%29.jpg',
        'image_source_url': 'https://en.wikipedia.org/wiki/British_Museum',
        'image_credit': 'Luke Massey & the Greater London National Park City Initiative — CC BY 2.0',
    },
    'Tower Bridge': {
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Tower_Bridge_at_Dawn.jpg/500px-Tower_Bridge_at_Dawn.jpg',
        'image_source_url': 'https://en.wikipedia.org/wiki/Tower_Bridge',
        'image_credit': 'Fuzzypiggy — CC BY-SA 3.0',
    },
    'Central Park': {
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Global_Citizen_Festival_Central_Park_New_York_City_from_NYonAir_%2815351915006%29.jpg/500px-Global_Citizen_Festival_Central_Park_New_York_City_from_NYonAir_%2815351915006%29.jpg',
        'image_source_url': 'https://en.wikipedia.org/wiki/Central_Park',
        'image_credit': 'Anthony Quintano from Hillsborough, NJ, United States — CC BY 2.0',
    },
    'Times Square': {
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/New_york_times_square-terabass.jpg/500px-New_york_times_square-terabass.jpg',
        'image_source_url': 'https://en.wikipedia.org/wiki/Times_Square',
        'image_credit': 'Terabass — CC BY-SA 3.0',
    },
    'Burj Khalifa': {
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Burj_Khalifa_%28worlds_tallest_building%29_and_the_Dubai_skyline_%2825781049892%29.jpg/500px-Burj_Khalifa_%28worlds_tallest_building%29_and_the_Dubai_skyline_%2825781049892%29.jpg',
        'image_source_url': 'https://en.wikipedia.org/wiki/Burj_Khalifa',
        'image_credit': 'imran shahabuddin — CC BY 2.0',
    },
    'Dubai Mall': {
        # The article's default image was a non-free/fair-use file not
        # available on Commons — used the mall's signature waterfall
        # installation instead, verified by viewing the photo directly.
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Dubai_MALL_Waterfalls.jpg/500px-Dubai_MALL_Waterfalls.jpg',
        'image_source_url': 'https://commons.wikimedia.org/wiki/File:Dubai_MALL_Waterfalls.jpg',
        'image_credit': 'Dakstor — CC BY-SA 4.0',
    },
    'Swayambhunath Stupa': {
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Swayambhunath_2018.jpg/500px-Swayambhunath_2018.jpg',
        'image_source_url': 'https://en.wikipedia.org/wiki/Swayambhunath',
        'image_credit': 'Nabin K. Sapkota — CC BY-SA 4.0',
    },
    'Thamel Market': {
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Thamel_at_night_-_Kathmandu%2C_Nepal_-_panoramio_%281%29.jpg/500px-Thamel_at_night_-_Kathmandu%2C_Nepal_-_panoramio_%281%29.jpg',
        'image_source_url': 'https://en.wikipedia.org/wiki/Thamel',
        'image_credit': 'Sergey Ashmarin — CC BY-SA 3.0',
    },
    'Sydney Opera House': {
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Sydney_Australia._%2821339175489%29.jpg/500px-Sydney_Australia._%2821339175489%29.jpg',
        'image_source_url': 'https://en.wikipedia.org/wiki/Sydney_Opera_House',
        'image_credit': 'Bernard Spragg. NZ from Christchurch, New Zealand — CC0',
    },
    'Bondi Beach': {
        'image_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Bondi_from_above.jpg/500px-Bondi_from_above.jpg',
        'image_source_url': 'https://en.wikipedia.org/wiki/Bondi_Beach',
        'image_credit': 'Nick Ang — CC BY-SA 4.0',
    },
}

DESTINATIONS = [
    {
        'name': 'Tokyo', 'country': 'Japan', 'rating': 4.8, 'best_time_to_visit': 'March – May',
        'latitude': 35.6762, 'longitude': 139.6503,
        'description': "Japan's neon-lit capital, blending ancient temples with futuristic skyscrapers.",
        'interests': ['culture', 'food', 'shopping', 'nightlife'],
        'places': [
            ('Senso-ji Temple', 'Temples', 4.7, '$', 'Ancient Buddhist temple in historic Asakusa.', 35.7148, 139.7967),
            ('Tokyo Skytree', 'Attractions', 4.6, '$$', 'Iconic broadcast tower with panoramic city views.', 35.7101, 139.8107),
        ],
    },
    {
        'name': 'Kyoto', 'country': 'Japan', 'rating': 4.9, 'best_time_to_visit': 'March – May, Oct – Nov',
        'latitude': 35.0116, 'longitude': 135.7681,
        'description': "Japan's cultural heart — thousands of temples, shrines, and historic geisha districts.",
        'interests': ['culture', 'history', 'photography'],
        'places': [
            ('Fushimi Inari Shrine', 'Temples', 4.8, '$', 'Famous shrine with thousands of vermillion torii gates.', 34.9671, 135.7727),
            ('Arashiyama Bamboo Grove', 'Parks', 4.6, '$', 'A serene, towering bamboo forest path.', 35.0094, 135.6683),
        ],
    },
    {
        'name': 'Osaka', 'country': 'Japan', 'rating': 4.6, 'best_time_to_visit': 'April – May',
        'latitude': 34.6937, 'longitude': 135.5023,
        'description': "A food-lover's paradise known for street eats, nightlife, and Osaka Castle.",
        'interests': ['food', 'nightlife', 'culture'],
        'places': [
            ('Osaka Castle', 'Historical Places', 4.5, '$', "One of Japan's most iconic historical landmarks.", 34.6873, 135.5262),
            ('Dotonbori', 'Nightlife', 4.6, '$$', 'Neon-lit dining and entertainment district.', 34.6687, 135.5012),
        ],
    },
    {
        'name': 'Fukuoka', 'country': 'Japan', 'rating': 4.5, 'best_time_to_visit': 'March – May, Sept – Nov',
        'latitude': 33.5904, 'longitude': 130.4017,
        'description': 'A laid-back coastal city famous for tonkotsu ramen, beaches, and easy nature access.',
        'interests': ['food', 'nature'],
        'places': [
            ('Ohori Park', 'Parks', 4.4, '$', 'Scenic lakeside park in the heart of the city.', 33.5845, 130.3808),
            ('Yatai Food Stalls', 'Restaurants', 4.7, '$', 'Open-air street food stalls serving local specialties.', 33.5926, 130.4092),
        ],
    },
    {
        'name': 'Paris', 'country': 'France', 'rating': 4.7, 'best_time_to_visit': 'April – June, Sept – Oct',
        'latitude': 48.8566, 'longitude': 2.3522,
        'description': 'The City of Light — iconic landmarks, world-class art, and unforgettable cuisine.',
        'interests': ['culture', 'history', 'food', 'shopping'],
        'places': [
            ('Eiffel Tower', 'Attractions', 4.7, '$$', "The world-famous iron lattice tower on the Champ de Mars.", 48.8584, 2.2945),
            ('Louvre Museum', 'Museums', 4.8, '$$', "The world's largest art museum, home to the Mona Lisa.", 48.8606, 2.3376),
        ],
    },
    {
        'name': 'London', 'country': 'United Kingdom', 'rating': 4.6, 'best_time_to_visit': 'May – Sept',
        'latitude': 51.5072, 'longitude': -0.1276,
        'description': 'A historic global capital packed with museums, royal landmarks, and diverse culture.',
        'interests': ['culture', 'history', 'shopping'],
        'places': [
            ('British Museum', 'Museums', 4.8, '$', 'World-renowned museum of human history and culture.', 51.5194, -0.1270),
            ('Tower Bridge', 'Attractions', 4.7, '$', 'Iconic Victorian bascule bridge over the Thames.', 51.5055, -0.0754),
        ],
    },
    {
        'name': 'New York', 'country': 'United States', 'rating': 4.7, 'best_time_to_visit': 'April – June, Sept – Nov',
        'latitude': 40.7128, 'longitude': -74.0060,
        'description': 'The city that never sleeps — an iconic skyline, Broadway, and nonstop energy.',
        'interests': ['nightlife', 'shopping', 'culture'],
        'places': [
            ('Central Park', 'Parks', 4.8, '$', 'Sprawling urban park in the middle of Manhattan.', 40.7829, -73.9654),
            ('Times Square', 'Attractions', 4.5, '$$', 'The dazzling, billboard-lit heart of NYC.', 40.7580, -73.9855),
        ],
    },
    {
        'name': 'Dubai', 'country': 'United Arab Emirates', 'rating': 4.6, 'best_time_to_visit': 'Nov – March',
        'latitude': 25.2048, 'longitude': 55.2708,
        'description': 'A futuristic desert metropolis of record-breaking skyscrapers and luxury shopping.',
        'interests': ['shopping', 'adventure', 'nightlife'],
        'places': [
            ('Burj Khalifa', 'Attractions', 4.8, '$$$', "The world's tallest building, with an observation deck.", 25.1972, 55.2744),
            ('Dubai Mall', 'Shopping', 4.6, '$$', 'One of the largest shopping malls on Earth.', 25.1975, 55.2796),
        ],
    },
    {
        'name': 'Kathmandu', 'country': 'Nepal', 'rating': 4.5, 'best_time_to_visit': 'Sept – Nov, March – April',
        'latitude': 27.7172, 'longitude': 85.3240,
        'description': 'Gateway to the Himalayas, rich with ancient temples and mountain adventure.',
        'interests': ['adventure', 'culture', 'nature'],
        'places': [
            ('Swayambhunath Stupa', 'Temples', 4.7, '$', 'Ancient hilltop stupa overlooking the Kathmandu valley.', 27.7149, 85.2903),
            ('Thamel Market', 'Shopping', 4.4, '$', 'Bustling tourist quarter of shops, cafés, and trekking gear.', 27.7154, 85.3123),
        ],
    },
    {
        'name': 'Sydney', 'country': 'Australia', 'rating': 4.7, 'best_time_to_visit': 'Sept – Nov, March – May',
        'latitude': -33.8688, 'longitude': 151.2093,
        'description': 'A stunning harbor city famous for its Opera House, beaches, and outdoor lifestyle.',
        'interests': ['beaches', 'adventure', 'nature', 'family_travel'],
        'places': [
            ('Sydney Opera House', 'Attractions', 4.8, '$$', 'World-famous performing arts venue on the harbour.', -33.8568, 151.2153),
            ('Bondi Beach', 'Beaches', 4.6, '$', "Sydney's most iconic beach and coastal walk.", -33.8908, 151.2743),
        ],
    },
]


class Command(BaseCommand):
    help = 'Seed the database with demo destinations, categories, and places, using verified, individually-checked Wikimedia Commons photographs.'

    def handle(self, *args, **options):
        categories = {}
        for name, icon in CATEGORIES:
            category, _ = Category.objects.update_or_create(
                name=name,
                defaults={'icon': icon, 'translations': CATEGORY_TRANSLATIONS.get(name, {})},
            )
            categories[name] = category
        self.stdout.write(self.style.SUCCESS(f'{len(categories)} categories ready.'))

        destination_count = 0
        place_count = 0
        for entry in DESTINATIONS:
            image = DESTINATION_IMAGES[entry['name']]
            destination, _ = Destination.objects.update_or_create(
                name=entry['name'], country=entry['country'],
                defaults={
                    'description': entry['description'],
                    'rating': entry['rating'],
                    'best_time_to_visit': entry['best_time_to_visit'],
                    'latitude': entry['latitude'],
                    'longitude': entry['longitude'],
                    'image_url': image['image_url'],
                    'image_source': IMAGE_SOURCE,
                    'image_source_url': image['image_source_url'],
                    'image_credit': image['image_credit'],
                    'interest_tags': entry['interests'],
                    'translations': DESTINATION_TRANSLATIONS.get(entry['name'], {}),
                },
            )
            destination_count += 1

            for place_name, category_name, rating, price_range, description, lat, lng in entry['places']:
                place_image = PLACE_IMAGES[place_name]
                Place.objects.update_or_create(
                    name=place_name, destination=destination,
                    defaults={
                        'category': categories[category_name],
                        'rating': rating,
                        'price_range': price_range,
                        'description': description,
                        'address': f'{entry["name"]}, {entry["country"]}',
                        'image_url': place_image['image_url'],
                        'image_source': IMAGE_SOURCE,
                        'image_source_url': place_image['image_source_url'],
                        'image_credit': place_image['image_credit'],
                        'latitude': lat,
                        'longitude': lng,
                        'translations': PLACE_TRANSLATIONS.get(place_name, {}),
                    },
                )
                place_count += 1

        self.stdout.write(self.style.SUCCESS(
            f'Seeded {destination_count} destinations and {place_count} places with verified images.'
        ))
