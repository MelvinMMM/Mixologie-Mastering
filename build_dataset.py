# -*- coding: utf-8 -*-
"""
Extraction and compilation script for Mixology Master App
Based on: "Référentiel Officiel des Cocktails Classiques de Référence (Édition 2025/2026)"
"""
import json

# --- 1. MODULES DEFINITION ---
MODULES = [
    {
        "id": 1,
        "title": "Guide des bonnes pratiques",
        "subtitle": "Pour les créations et revisites",
        "icon": "✨",
        "description": "Règles d'or des créations : valorisation de l'eau-de-vie, règle des 3 S, ordre de verse, notation en ml et éco-responsabilité.",
        "gradient": "from-amber-500 to-orange-600"
    },
    {
        "id": 2,
        "title": "Catégories et Types",
        "subtitle": "Contenances & Moments de dégustation",
        "icon": "🍸",
        "description": "Short drinks vs Long drinks (Moyen mémo : Catégorie = Contenance) et Before dinner, After dinner, All day (Type = Temps).",
        "gradient": "from-emerald-500 to-teal-700"
    },
    {
        "id": 3,
        "title": "Familles de cocktails",
        "subtitle": "Structures et recettes types",
        "icon": "🏷️",
        "description": "Sour, Fizz, Colada, Julep, Tiki, Smash, Old-Fashioned, Flip, Collins, Daisy...",
        "gradient": "from-blue-500 to-indigo-700"
    },
    {
        "id": 4,
        "title": "Méthodes de réalisation",
        "subtitle": "Gestes et étapes techniques",
        "icon": "🥄",
        "description": "Les 4 techniques officielles : Shaker, Verre à mélange, Direct au verre, Blender. Ordre strict des étapes (mirer, rafraîchir, égoutter...).",
        "gradient": "from-purple-500 to-pink-600"
    },
    {
        "id": 5,
        "title": "Verrerie de service",
        "subtitle": "Incontournables et Complémentaires",
        "icon": "🥂",
        "description": "Nick & Nora, Rocks, Highball, Coupe, Flûte, Mule, Copa, Absinthe, Toddy, Hurricane, Julep, Tiki...",
        "gradient": "from-cyan-500 to-blue-600"
    },
    {
        "id": 6,
        "title": "Matériel du barman",
        "subtitle": "Outils indispensables et shakers",
        "icon": "🛠️",
        "description": "Shakers Boston vs Continental vs 3 pièces (Cobbler), Passoires (Hawthorne, Julep, Fine), Jigger, Pilon, Bar spoon...",
        "gradient": "from-amber-600 to-yellow-500"
    },
    {
        "id": 7,
        "title": "Fiches Cocktails de référence",
        "subtitle": "Recettes cultes Short & Long drinks",
        "icon": "🍹",
        "description": "Les 36 cocktails officiels : Aviation, Negroni, Margarita, Mojito, Spritz, Caipirinha, Mai Tai, Dry Martini, Manhattan...",
        "gradient": "from-rose-500 to-red-600"
    },
    {
        "id": 8,
        "title": "Calcul du TAV",
        "subtitle": "Titre Alcoométrique Volumique",
        "icon": "🧮",
        "description": "Formule mathématique officielle de calcul du degré d'alcool d'un cocktail, volumes d'alcool pur et calculs pratiques.",
        "gradient": "from-violet-600 to-purple-800"
    },
    {
        "id": 9,
        "title": "Lexique professionnel",
        "subtitle": "Le vocabulaire officiel du bar",
        "icon": "📖",
        "description": "Albédos, Aquafaba, Cuban roll, Dry shake, Fat washing, Float, Stir, Strain, Muter, Pourer, Pre-batch, Zeste...",
        "gradient": "from-teal-600 to-emerald-800"
    }
]

# --- 2. QUESTIONS GENERATION PER MODULE ---
QUESTIONS = [
    # ==================== MODULE 1 : BONNES PRATIQUES ====================
    {
        "id": "m1_q1",
        "moduleId": 1,
        "badge": "Règle d'or",
        "question": "Lors d'une création de cocktail, quel est le nombre maximal d'ingrédients recommandé pour veiller à l'équilibre organoleptique ?",
        "options": ["4 ingrédients maximum", "6 ingrédients maximum", "8 ingrédients maximum", "10 ingrédients maximum"],
        "correctAnswer": 1,
        "explanation": "Selon le Guide des bonnes pratiques (Partie 1), il est recommandé de se limiter à 6 ingrédients maximum pour veiller à l'équilibre organoleptique du cocktail."
    },
    {
        "id": "m1_q2",
        "moduleId": 1,
        "badge": "Eau-de-vie",
        "question": "Selon les règles d'usage du référentiel, combien d'eaux-de-vie est-il d'usage d'utiliser dans une recette afin de respecter ses caractéristiques gustatives ?",
        "options": ["Une seule eau-de-vie", "Au minimum deux eaux-de-vie", "Toujours trois eaux-de-vie complémentaires", "Le nombre d'eaux-de-vie est libre et sans règle"],
        "correctAnswer": 0,
        "explanation": "Il est d'usage d'utiliser une seule eau-de-vie afin de respecter ses caractéristiques gustatives (bien que des exceptions existent)."
    },
    {
        "id": "m1_q3",
        "moduleId": 1,
        "badge": "Ordre de verse",
        "question": "Dans quel ordre doit-on verser les ingrédients lors d'une création ou d'une revisite afin de limiter les pertes en cas d'erreur de dosage ?",
        "options": ["Du plus cher au moins cher", "Du moins cher au plus cher", "Du plus alcoolisé au moins alcoolisé", "Dans l'ordre alphabétique des ingrédients"],
        "correctAnswer": 1,
        "explanation": "Le référentiel indique expressément de verser les ingrédients du moins cher au plus cher (ex: sirops/jus d'abord, puis spiritueux nobles) pour limiter les coûts de perte en cas d'erreur."
    },
    {
        "id": "m1_q4",
        "moduleId": 1,
        "badge": "Règle des 3 S",
        "question": "Que signifient les « 3 S » de la règle d'équilibre d'un cocktail selon le référentiel ?",
        "options": [
            "Sweet, Sour, Strong",
            "Shaker, Stir, Strain",
            "Saison, Service, Saveur",
            "Smooth, Spicy, Salty"
        ],
        "correctAnswer": 0,
        "explanation": "La règle des 3 S repose sur : SWEET (la douceur / sucre), SOUR (l'acidité / lien), et STRONG (la puissance / alcool apporté par le spiritueux)."
    },
    {
        "id": "m1_q5",
        "moduleId": 1,
        "badge": "Unités de mesure",
        "question": "Quelle unité de mesure est désormais privilégiée pour rédiger les recettes afin de simplifier l'exportation à l'international et l'adaptation à la verrerie ?",
        "options": ["Le Centilitre (cl)", "Le Millilitre (ml)", "L'Once liquide (oz)", "La Goutte (drop)"],
        "correctAnswer": 1,
        "explanation": "Le référentiel préconise de privilégier les dosages exprimés en ml (1 cl = 10 ml) pour faciliter l'exportation internationale et l'ajustement précis à la verrerie."
    },
    {
        "id": "m1_q6",
        "moduleId": 1,
        "badge": "Éco-responsabilité",
        "question": "Concernant l'utilisation des pailles au bar, quelle est la règle officielle formulée dans le référentiel ?",
        "options": [
            "Mettre obligatoirement deux pailles en plastique dans chaque Long drink",
            "Utiliser des pailles en matière écoresponsable et uniquement à la demande du client",
            "Ne jamais fournir de paille sous aucun prétexte",
            "Mettre une paille systématiquement dans tous les Short drinks"
        ],
        "correctAnswer": 1,
        "explanation": "Le référentiel mentionne en N.B. : « Utiliser des pailles en matière écoresponsable et à la demande du client »."
    },
    {
        "id": "m1_q7",
        "moduleId": 1,
        "badge": "Garniture",
        "question": "Dans un esprit éco-responsable et anti-gaspillage, que peut-on utiliser pour remplacer les fruits frais en garniture ?",
        "options": ["Des décors en plastique réutilisables", "Des fruits déshydratés", "Des colorants artificiels", "Des ombrelles en papier"],
        "correctAnswer": 1,
        "explanation": "Le référentiel précise que dans un esprit éco-responsable et anti-gaspillage, les fruits déshydratés peuvent remplacer les fruits frais lorsque c'est possible."
    },
    {
        "id": "m1_q8",
        "moduleId": 1,
        "badge": "Équilibre",
        "question": "Dans la règle des 3 S, par quoi peut être apporté l'élément « SOUR » ?",
        "options": [
            "Uniquement par du sucre en poudre blanc",
            "Par un agrume, du verjus ou une solution acide",
            "Par de la crème de coco ou du lait",
            "Par une eau-de-vie brune vieillie en fût"
        ],
        "correctAnswer": 1,
        "explanation": "Le SOUR représente l'acidité et le liant du cocktail, apporté par un agrume (citron jaune, vert), du verjus ou une solution acide."
    },
    {
        "id": "m1_q9",
        "moduleId": 1,
        "badge": "Verrerie",
        "question": "Pourquoi est-il crucial d'adapter le dosage de la recette à la taille de la verrerie utilisée ?",
        "options": [
            "Car selon les fournisseurs, les verres possèdent une contenance différente pour un même type de verre",
            "Pour que le cocktail coûte toujours le même prix peu importe le bar",
            "Pour changer obligatoirement le nom du cocktail",
            "Pour respecter la loi sur la vaisselle de bar"
        ],
        "correctAnswer": 0,
        "explanation": "Selon les fournisseurs, les verres possèdent une contenance différente. Il est donc indispensable d'adapter la recette à la contenance réelle du verre de service."
    },
    {
        "id": "m1_q10",
        "moduleId": 1,
        "badge": "Choix de la technique",
        "question": "Dans quel cas le référentiel préconise-t-il d'utiliser le Verre à mélange plutôt que le Shaker ?",
        "options": [
            "Pour les cocktails contenant de la purée de fruits, de la crème ou des œufs",
            "Pour mélanger et rafraîchir en apportant une dilution nécessaire à l'homogénéisation des produits notamment alcooliques (sans jus ni sodas)",
            "Pour tous les cocktails pétillants à base de champagne uniquement",
            "Pour broyer la glace pilée avec des herbes"
        ],
        "correctAnswer": 1,
        "explanation": "Le verre à mélange est utilisé pour mélanger et rafraîchir en apportant une dilution nécessaire à l'homogénéisation des produits notamment alcooliques (il ne s'utilise pas pour les jus, sodas ou émulsifiants)."
    },

    # ==================== MODULE 2 : CATÉGORIES ET TYPES ====================
    {
        "id": "m2_q1",
        "moduleId": 2,
        "badge": "Moyen mémotechnique",
        "question": "Quels sont les deux moyens mémotechniques officiels indiqués dans le référentiel pour Catégorie et Type ?",
        "options": [
            "Catégorie = Contenance  /  Type = Temps",
            "Catégorie = Couleur  /  Type = Teneur",
            "Catégorie = Client  /  Type = Tarif",
            "Catégorie = Chaleur  /  Type = Texture"
        ],
        "correctAnswer": 0,
        "explanation": "Les moyens mémotechniques officiels sont : « Catégorie = Contenance » et « Type = Temps » (moment de dégustation)."
    },
    {
        "id": "m2_q2",
        "moduleId": 2,
        "badge": "Contenance Short Drink",
        "question": "Quelle est la contenance maximale d'un SHORT DRINK selon le référentiel ?",
        "options": ["Inférieur ou égal à 50 ml", "Ne dépasse pas 100 ml (inférieur à 10 cl)", "Ne dépasse pas 150 ml", "Ne dépasse pas 250 ml"],
        "correctAnswer": 1,
        "explanation": "Un SHORT DRINK est plutôt puissant et ne dépasse pas 100 ml (inférieur à 10 cl)."
    },
    {
        "id": "m2_q3",
        "moduleId": 2,
        "badge": "Contenance Long Drink",
        "question": "À partir de quel volume un cocktail est-il classé dans la catégorie LONG DRINK ?",
        "options": ["À partir de 60 ml", "À partir de 100 ml (à partir de 10 cl)", "À partir de 200 ml", "À partir de 330 ml"],
        "correctAnswer": 1,
        "explanation": "Un LONG DRINK est plutôt allongé et sa contenance démarre à partir de 100 ml (à partir de 10 cl)."
    },
    {
        "id": "m2_q4",
        "moduleId": 2,
        "badge": "Types de cocktails",
        "question": "Quels sont les 3 TYPES officiels de cocktails (selon le moment de dégustation) ?",
        "options": [
            "Before Dinner (Apéritif), After Dinner (Digestif), All Day Cocktail (Tout moment)",
            "Matin, Midi, Soir",
            "Hiver, Printemps, Été",
            "Alcoolisé, Sans alcool, Faiblement alcoolisé"
        ],
        "correctAnswer": 0,
        "explanation": "Les 3 types officiels sont : Before Dinner (Apéritif), After Dinner (Digestif) et All Day Cocktail (Tout moment)."
    },
    {
        "id": "m2_q5",
        "moduleId": 2,
        "badge": "Before Dinner",
        "question": "Quel est le profil gustatif typique d'un cocktail de type BEFORE DINNER (Apéritif) ?",
        "options": [
            "Très onctueux, chaud et chocolaté",
            "Plus ou moins amer, parfois sec, consommé avant le repas pour ouvrir l'appétit",
            "Exclusivement très sucré et crémeux",
            "Obligatoirement sans alcool et gazeux"
        ],
        "correctAnswer": 1,
        "explanation": "Un Before Dinner est plus ou moins amer, parfois sec, consommé de préférence avant le repas."
    },
    {
        "id": "m2_q6",
        "moduleId": 2,
        "badge": "After Dinner",
        "question": "Quel est le profil gustatif d'un cocktail de type AFTER DINNER (Digestif) ?",
        "options": [
            "Plus ou moins liquoreux, parfois puissant, consommé de préférence après le repas",
            "Hyper acide et effervescent",
            "Composé uniquement d'eau et d'agrumes",
            "Toujours servi dans un verre shooter avec du sel"
        ],
        "correctAnswer": 0,
        "explanation": "Un After Dinner est plus ou moins liquoreux, parfois puissant, consommé de préférence après le repas (ex: Espresso Martini, Alexander...)."
    },
    {
        "id": "m2_q7",
        "moduleId": 2,
        "badge": "All Day",
        "question": "Comment est décrit un cocktail de type ALL DAY COCKTAIL ?",
        "options": [
            "Plus ou moins fruité, souvent désaltérant, consommé quel que soit le moment de la journée",
            "Un cocktail servi uniquement entre minuit et 6h du matin",
            "Un cocktail contenant au minimum 50% de caféine",
            "Un cocktail exclusivement servi au pichet"
        ],
        "correctAnswer": 0,
        "explanation": "Un All Day Cocktail est plus ou moins fruité, souvent désaltérant, consommé quel que soit le moment de la journée (ex: Mojito, Piña Colada, Caipirinha...)."
    },
    {
        "id": "m2_q8",
        "moduleId": 2,
        "badge": "Classification",
        "question": "Le cocktail NEGRONI est classé dans quelle catégorie et quel type ?",
        "options": [
            "Short drink / Before dinner",
            "Long drink / After dinner",
            "Long drink / All day cocktail",
            "Short drink / After dinner"
        ],
        "correctAnswer": 0,
        "explanation": "Le Negroni fait 90 ml au total (Short drink) et présente une amertume apéritive marquée (Before dinner)."
    },

    # ==================== MODULE 3 : FAMILLES DE COCKTAILS ====================
    {
        "id": "m3_q1",
        "moduleId": 3,
        "badge": "Famille SOUR",
        "question": "Quelle est la composition fondamentale d'un cocktail de la famille des SOUR ?",
        "options": [
            "Un spiritueux, du sucre, du citron (ou autre agrume), souvent avec du blanc d'œuf ou émulsifiant",
            "De la tequila, du jus de tomate et de la sauce Worcestershire",
            "Du rhum, du jus d'ananas et de la crème de coco",
            "Du gin, du vermouth rouge et du Campari"
        ],
        "correctAnswer": 0,
        "explanation": "Le SOUR est un Short drink réalisé au shaker composé d'un spiritueux, de sucre, de citron (ou autre agrume) et souvent de blanc d'œuf / émulsifiant (ex: Whiskey Sour)."
    },
    {
        "id": "m3_q2",
        "moduleId": 3,
        "badge": "Famille FIZZ",
        "question": "Comment se définit la famille des FIZZ selon le référentiel ?",
        "options": [
            "Short drink chaud au rhum et beurre",
            "Long drink réalisé au shaker, composé d'eau-de-vie, sucre, citron et complété d'eau gazeuse",
            "Cocktail à étages servi sans glaçons",
            "Mélange de vin blanc et de crème de cassis"
        ],
        "correctAnswer": 1,
        "explanation": "Le FIZZ est un Long drink réalisé au shaker, composé d'eau-de-vie, sucre, citron et allongé d'eau gazeuse. Le plus connu est le Gin Fizz."
    },
    {
        "id": "m3_q3",
        "moduleId": 3,
        "badge": "Famille COLADA",
        "question": "Quels sont les composants incontournables de la famille des COLADA ?",
        "options": [
            "Eau-de-vie, crème de coco et jus de fruit (réalisé au shaker ou au blender)",
            "Vodka, liqueur de café et crème fraîche",
            "Whiskey, bitters et zeste d'orange",
            "Tequila, triple sec et jus de citron vert"
        ],
        "correctAnswer": 0,
        "explanation": "La COLADA est un Long drink (shaker ou blender) composé d'eau-de-vie, de crème de coco et de jus de fruit (ex: Piña Colada)."
    },
    {
        "id": "m3_q4",
        "moduleId": 3,
        "badge": "Famille JULEP",
        "question": "Dans quel récipient est traditionnellement réalisé et servi un cocktail de la famille JULEP (comme le Mint Julep) ?",
        "options": ["Une timbale (gobelet métallique)", "Une flûte à champagne", "Un verre à martini", "Une coupe vintage"],
        "correctAnswer": 0,
        "explanation": "Le JULEP est un Short drink réalisé directement dans une timbale en métal, composé d'eau-de-vie vieillie, sucre et menthe fraîche."
    },
    {
        "id": "m3_q5",
        "moduleId": 3,
        "badge": "Famille OLD-FASHIONED",
        "question": "Quelle est la structure de la famille OLD-FASHIONED ?",
        "options": [
            "Short drink direct au verre : eau-de-vie vieillie, sucre et aromatic bitters",
            "Long drink au shaker : rhum, curaçao et jus d'orange",
            "Short drink au verre à mélange : gin, vermouth sec et olive",
            "Long drink au blender : vodka, purée de fraise et limonade"
        ],
        "correctAnswer": 0,
        "explanation": "La famille OLD-FASHIONED est un Short drink réalisé directement au verre composé d'eau-de-vie vieillie, de sucre et d'aromatic bitters."
    },
    {
        "id": "m3_q6",
        "moduleId": 3,
        "badge": "Famille SMASH",
        "question": "Qu'est-ce qui caractérise particulièrement la famille des SMASH (ex: Gin Basil Smash) ?",
        "options": [
            "La présence d'une herbe aromatique écrasée/frappée avec l'eau-de-vie, le sucre et l'agrume",
            "L'utilisation exclusive de crème glacée à la vanille",
            "Le fait d'enflammer le cocktail avant le service",
            "L'ajout d'une bière brune en complément"
        ],
        "correctAnswer": 0,
        "explanation": "Le SMASH est un Short drink réalisé au shaker composé d'une eau-de-vie, d'une herbe aromatique (basilic, menthe...), de sucre et de citron/agrume."
    },
    {
        "id": "m3_q7",
        "moduleId": 3,
        "badge": "Famille TIKI",
        "question": "Quels ingrédients retrouve-t-on typiquement dans la famille TIKI (ex: Mai Tai) ?",
        "options": [
            "Eau-de-vie (généralement rhum(s)), sucre/sirop d'épices, citron vert/agrume et plusieurs jus de fruits",
            "Vodka, vermouth dry et oignon au vinaigre",
            "Cognac, crème de cacao et crème liquide",
            "Gin, eau tonique et tranche de concombre"
        ],
        "correctAnswer": 0,
        "explanation": "Les TIKI sont des Long drinks (shaker/blender) composés d'eau-de-vie (généralement un ou plusieurs rhums), sucre/épices, agrume et jus de fruits."
    },
    {
        "id": "m3_q8",
        "moduleId": 3,
        "badge": "Famille FLIP",
        "question": "Quel ingrédient spécifique entre dans la composition d'un FLIP selon le lexique ?",
        "options": ["Un jaune d'œuf", "Du blanc d'œuf uniquement", "Du lait concentré sucré", "Du vinaigre balsamique"],
        "correctAnswer": 0,
        "explanation": "Le FLIP est un Short drink composé d'un jaune d'œuf, d'une base de vin et/ou d'un spiritueux, saupoudré de noix de muscade râpée."
    },
    {
        "id": "m3_q9",
        "moduleId": 3,
        "badge": "Famille COLLINS",
        "question": "Quelle est la différence fondamentale entre un FIZZ et un COLLINS ?",
        "options": [
            "Le Collins a la même composition qu'un Fizz, mais il est réalisé DIRECTEMENT AU VERRE (alors que le Fizz est au shaker)",
            "Le Collins est servi chaud alors que le Fizz est glacé",
            "Le Collins utilise de la vodka et le Fizz utilise du gin",
            "Le Collins ne contient aucun liquide gazeux"
        ],
        "correctAnswer": 0,
        "explanation": "Le COLLINS est un Long drink ayant la même composition qu'un Fizz, mais réalisé directement au verre (Tom Collins, John Collins)."
    },

    # ==================== MODULE 4 : MÉTHODES DE RÉALISATION ====================
    {
        "id": "m4_q1",
        "moduleId": 4,
        "badge": "Verre à mélange",
        "question": "Dans la technique au Verre à mélange, pendant combien de temps doit-on mélanger les ingrédients à l'aide de la cuillère de bar ?",
        "options": ["5 secondes", "15 à 20 secondes", "45 à 60 secondes", "2 minutes pleines"],
        "correctAnswer": 1,
        "explanation": "Le protocole officiel stipule : « Mélanger à l'aide de la cuillère de bar pendant 15 à 20 secondes » pour apporter le rafraîchissement et la dilution adéquate."
    },
    {
        "id": "m4_q2",
        "moduleId": 4,
        "badge": "Au Shaker",
        "question": "Pendant combien de temps doit-on frapper (shaker) un cocktail au shaker selon la méthode officielle ?",
        "options": ["1 à 2 secondes", "7 à 10 secondes", "30 secondes", "1 minute"],
        "correctAnswer": 1,
        "explanation": "Le protocole officiel indique : « Fermer le shaker et frapper 7 à 10 secondes »."
    },
    {
        "id": "m4_q3",
        "moduleId": 4,
        "badge": "Shaker Boston",
        "question": "Dans quelle timbale du Shaker Boston doit-on verser les ingrédients de la recette ?",
        "options": [
            "Dans la petite timbale du shaker",
            "Dans la grande timbale du shaker directement sur les glaçons",
            "Directement dans le verre de service",
            "Peu importe, les deux timbales sont identiques"
        ],
        "correctAnswer": 0,
        "explanation": "On met les glaçons dans la grande timbale pour la rafraîchir, et on verse les ingrédients dans la PETITE timbale (sans glace au départ pour maîtriser le dosage et la température)."
    },
    {
        "id": "m4_q4",
        "moduleId": 4,
        "badge": "Étape Initiale",
        "question": "Quelle est la TOUTE PREMIÈRE étape obligatoire commune à la réalisation au shaker, au verre à mélange et direct au verre ?",
        "options": [
            "Mirer le verre (vérifier la propreté et l'intégrité du verre)",
            "Verser l'alcool le plus cher",
            "Mettre la garniture au fond du verre",
            "Mettre le stick mélangeur"
        ],
        "correctAnswer": 0,
        "explanation": "La toute première étape de chaque fiche technique est toujours : « Mirer le verre » (vérifier visuellement la propreté, la brillance et l'absence d'ébréchure)."
    },
    {
        "id": "m4_q5",
        "moduleId": 4,
        "badge": "Complément gazeux",
        "question": "Dans une recette au shaker avec un complément non effervescent (ex: jus), que doit-on faire avant de compléter le verre ?",
        "options": [
            "Faire chauffer le complément au micro-ondes",
            "Rafraîchir le complément dans la grande timbale du shaker avant de compléter le verre (sauf boissons effervescentes stockées au frais)",
            "Ne jamais ajouter de complément",
            "Le congeler sous forme de glaçon"
        ],
        "correctAnswer": 1,
        "explanation": "Le référentiel indique : « Rafraîchir le complément dans la grande timbale du shaker avant de compléter le verre (sauf pour les boissons effervescentes qui sont stockées au frais) »."
    },
    {
        "id": "m4_q6",
        "moduleId": 4,
        "badge": "Égoutter la glace",
        "question": "Pourquoi doit-on obligatoirement « égoutter la glace » du verre à mélange ou du shaker avant de verser / frapper ?",
        "options": [
            "Pour éliminer l'eau de fonte résiduelle et éviter une sur-dilution incontrôlée du cocktail",
            "Pour récupérer l'eau et la boire",
            "Pour faire de la place pour les pailles",
            "C'est une tradition sans impact gustatif"
        ],
        "correctAnswer": 0,
        "explanation": "Égoutter l'eau de fonte permet de ne conserver que des glaçons sains et d'éviter d'apporter de l'eau résiduelle qui noierait les arômes du cocktail."
    },

    # ==================== MODULE 5 : VERRERIE DE SERVICE ====================
    {
        "id": "m5_q1",
        "moduleId": 5,
        "badge": "Incontournables",
        "question": "Quels sont les verres classés parmi « LES INCONTOURNABLES » de la verrerie de service ?",
        "options": [
            "Shot, Highball, Rocks, Dégustation, Nick & Nora, Coupe, Martini, Verre à vin, Flûte",
            "Tiki, Mule, Absinthe, Copa, Chope à bière, Picholet",
            "Gobelet carton, Verre doseur, Bocal Mason jar",
            "Verre tulipe uniquement"
        ],
        "correctAnswer": 0,
        "explanation": "Selon la Partie 5, les Incontournables sont : Shot, Highball, Rocks, Dégustation, Nick & Nora, Coupe, Martini, Verre à vin et Flûte."
    },
    {
        "id": "m5_q2",
        "moduleId": 5,
        "badge": "Nick & Nora",
        "question": "Pour quel genre de cocktail le verre « Nick & Nora » est-il particulièrement utilisé dans le référentiel ?",
        "options": [
            "Les Short drinks servis sans glace (UP) comme l'Aviation, Bamboo, Cosmopolitan, Daiquiri, Dry Martini...",
            "Les cocktails de 500 ml avec beaucoup de glace pilée",
            "Les bières pression",
            "Les cocktails chauds type Irish Coffee"
        ],
        "correctAnswer": 0,
        "explanation": "Le verre Nick & Nora est le verre emblématique moderne des Short drinks élégants servis rafraîchis sans glaçons."
    },
    {
        "id": "m5_q3",
        "moduleId": 5,
        "badge": "Complémentaires",
        "question": "Lequel des verres suivants fait partie de la verrerie « COMPLÉMENTAIRE » ?",
        "options": ["Le verre Mule (ou timbale en cuivre)", "Le verre Highball", "Le verre Rocks", "Le verre Martini"],
        "correctAnswer": 0,
        "explanation": "Les verres complémentaires comprennent : Digestif, Punch, Toddy, Absinthe, Hurricane, Copa, Bière, Julep, Mule, Tiki, Fantaisie."
    },
    {
        "id": "m5_q4",
        "moduleId": 5,
        "badge": "Cocktail chaud",
        "question": "Quel verre complémentaire est spécialement dédié aux cocktails chauds (Hot Drinks) ?",
        "options": ["Le verre TODDY", "Le verre COPA", "Le verre SHOT", "Le verre ABSINTHE"],
        "correctAnswer": 0,
        "explanation": "Le verre Toddy (en verre épais muni d'une anse) est conçu pour résister à la chaleur et servir les cocktails chauds (Hot Toddy, Grogs...)."
    },
    {
        "id": "m5_q5",
        "moduleId": 5,
        "badge": "Contenance Shooter",
        "question": "Quelle est la contenance standard d'une boisson servie dans un verre shot (Shooter) ?",
        "options": ["30 à 60 ml", "100 à 150 ml", "200 ml", "10 ml maximum"],
        "correctAnswer": 0,
        "explanation": "D'après le lexique officiel : un Shooter a une contenance de 30 à 60 ml, servi dans un verre shot."
    },

    # ==================== MODULE 6 : MATÉRIEL DU BARMAN ====================
    {
        "id": "m6_q1",
        "moduleId": 6,
        "badge": "Shaker Cobbler",
        "question": "Quelle est la particularité principale du Shaker Trois Pièces (Cobbler Shaker) ?",
        "options": [
            "Il possède une passoire intégrée dans son bouchon intermédiaire",
            "Il est composé de deux timbales métalliques sans filtre",
            "Il fonctionne avec une batterie électrique",
            "Il est exclusivement en verre teinté"
        ],
        "correctAnswer": 0,
        "explanation": "Le Shaker Trois Pièces (Cobbler) se différencie par sa passoire intégrée située entre la timbale et le bouchon supérieur."
    },
    {
        "id": "m6_q2",
        "moduleId": 6,
        "badge": "Shaker Boston vs Continental",
        "question": "Comment se différencient le Shaker Boston et le Shaker Continental (Parisian) ?",
        "options": [
            "Le Shaker Boston s'emboîte avec un axe décalé, tandis que le Shaker Continental s'emboîte parfaitement droit",
            "Le Shaker Boston a un moteur et le Continental est manuel",
            "Le Shaker Continental possède un manche en bois",
            "Il n'y a aucune différence technique"
        ],
        "correctAnswer": 0,
        "explanation": "Shaker Boston (double tin) : 2 timbales emboîtées avec axe décalé. Shaker Continental (Parisian) : 2 timbales qui s'emboîtent parfaitement dans le même axe."
    },
    {
        "id": "m6_q3",
        "moduleId": 6,
        "badge": "Passoires",
        "question": "Quelle passoire utilise-t-on spécifiquement pour le Verre à mélange selon les ustensiles de référence ?",
        "options": [
            "La passoire à Julep (Julep strainer)",
            "La passoire à cocktail (Hawthorne) à ressort",
            "Une écumoire de cuisine",
            "Un filtre à café en papier"
        ],
        "correctAnswer": 0,
        "explanation": "La passoire à Julep est traditionnellement et techniquement l'outil de prédilection adapté à la forme circulaire du verre à mélange."
    },
    {
        "id": "m6_q4",
        "moduleId": 6,
        "badge": "Double filtration",
        "question": "En quoi consiste la « double filtration » (double strain) ?",
        "options": [
            "Filtrer le cocktail à l'aide d'une passoire fine en plus de la passoire à cocktail pour retenir pulpes et éclats de glace",
            "Filtrer le cocktail deux fois de suite dans deux verres différents",
            "Faire passer le cocktail à travers du charbon actif",
            "Mélanger deux fois avec deux cuillères de bar"
        ],
        "correctAnswer": 0,
        "explanation": "La double filtration consiste à verser le cocktail à travers la passoire à cocktail ET une passoire fine (fine strainer) tenue au-dessus du verre."
    },
    {
        "id": "m6_q5",
        "moduleId": 6,
        "badge": "Doseur",
        "question": "Quel est le terme anglo-saxon officiel désignant le doseur de bar ?",
        "options": ["Jigger", "Pourer", "Stirrer", "Muddler"],
        "correctAnswer": 0,
        "explanation": "Le Jigger est le terme anglo-saxon désignant le doseur gradué utilisé par le barman."
    },
    {
        "id": "m6_q6",
        "moduleId": 6,
        "badge": "Bec verseur",
        "question": "Quel est le terme anglo-saxon désignant le bec verseur fixé sur les bouteilles pour réguler l'écoulement ?",
        "options": ["Pourer", "Bar spoon", "Squeezer", "Bar mat"],
        "correctAnswer": 0,
        "explanation": "Le Pourer désigne le bec verseur en inox ou plastique inséré dans le goulot des bouteilles."
    },

    # ==================== MODULE 7 : FICHES COCKTAILS (SHORT & LONG) ====================
    {
        "id": "m7_q1",
        "moduleId": 7,
        "badge": "Aviation",
        "question": "Quels sont les ingrédients et dosages officiels du cocktail AVIATION (Short drink) ?",
        "options": [
            "40 ml Gin, 15 ml Marasquin, 15 ml Jus de citron jaune, 5 ml Crème de violette",
            "50 ml Vodka, 20 ml Sirop de fraise, 10 ml Citron vert",
            "40 ml Rhum blanc, 20 ml Jus d'ananas, 10 ml Menthe",
            "50 ml Tequila, 20 ml Triple sec, 20 ml Citron"
        ],
        "correctAnswer": 0,
        "explanation": "Recette officielle Aviation : 40 ml Gin, 15 ml Marasquin, 15 ml Jus de citron jaune, 5 ml Crème de violette. Servi dans un verre Nick & Nora avec une cerise à l'eau-de-vie."
    },
    {
        "id": "m7_q2",
        "moduleId": 7,
        "badge": "Aviation - Histoire",
        "question": "Dans quel livre et en quelle année la recette de l'Aviation a-t-elle été publiée pour la première fois ?",
        "options": [
            "« Recipes for mixed drinks » de Hugo Ensslin à New York en 1916",
            "« The Savoy Cocktail Book » de Harry Craddock à Londres en 1930",
            "« American Bar » de Frank Newman à Paris en 1904",
            "« Bartender's Guide » de Jerry Thomas en 1862"
        ],
        "correctAnswer": 0,
        "explanation": "L'Aviation a été publié dans le livre « Recipes for mixed drinks » par Hugo Ensslin à New York en 1916."
    },
    {
        "id": "m7_q3",
        "moduleId": 7,
        "badge": "Negroni",
        "question": "Quelle est la composition exacte du NEGRONI selon la fiche officielle ?",
        "options": [
            "30 ml Gin, 30 ml Vermouth rouge, 30 ml Bitter (ex: Campari)",
            "40 ml Vodka, 20 ml Vermouth blanc, 10 ml Angostura",
            "50 ml Bourbon, 20 ml Sirop de sucre, 2 traits de bitter",
            "30 ml Tequila, 30 ml Mezcal, 30 ml Citron vert"
        ],
        "correctAnswer": 0,
        "explanation": "Le Negroni est un classique aux proportions parfaites : 30 ml Gin, 30 ml Vermouth rouge, 30 ml Bitter. Réalisé au verre à mélange (ou direct) dans un verre Rocks avec un zeste d'orange exprimé."
    },
    {
        "id": "m7_q4",
        "moduleId": 7,
        "badge": "Negroni Sbagliato",
        "question": "Dans la variante « NEGRONI SBAGLIATO », quel ingrédient remplace le Gin ?",
        "options": ["Le Prosecco (vin effervescent)", "La Vodka", "Le Mezcal", "Le Cognac"],
        "correctAnswer": 0,
        "explanation": "Dans le Negroni Sbagliato (« mal fait » / « raté » en italien), le Prosecco remplace le Gin."
    },
    {
        "id": "m7_q5",
        "moduleId": 7,
        "badge": "Dry Martini",
        "question": "Quels sont les dosages officiels du DRY MARTINI dans le référentiel ?",
        "options": [
            "50 ml Gin, 10 ml Vermouth Dry, 1 trait Bitter orange (facultatif)",
            "30 ml Gin, 30 ml Vermouth Dry, 30 ml Eau gazeuse",
            "60 ml Vodka, 30 ml Liqueur de café",
            "40 ml Rhum, 20 ml Vermouth rouge"
        ],
        "correctAnswer": 0,
        "explanation": "Fiche technique officielle : 50 ml Gin, 10 ml Vermouth Dry, 1 trait Bitters orange. Préparé au verre à mélange, servi en verre Nick & Nora (ou Martini) avec une olive ou un zeste de citron."
    },
    {
        "id": "m7_q6",
        "moduleId": 7,
        "badge": "Gibson",
        "question": "Quelle est la garniture spécifique qui transforme un Dry Martini en GIBSON ?",
        "options": ["Un oignon au vinaigre (petit oignon blanc perlé)", "Une tranche de concombre", "Une cerise à l'eau-de-vie", "Un piment oiseau"],
        "correctAnswer": 0,
        "explanation": "Le Gibson est un Dry Martini garni d'un oignon au vinaigre (cocktail onion) à la place de l'olive ou du zeste de citron."
    },
    {
        "id": "m7_q7",
        "moduleId": 7,
        "badge": "Cosmopolitan",
        "question": "Quels ingrédients composent le COSMOPOLITAN officiel ?",
        "options": [
            "40 ml Vodka citron, 15 ml Triple sec, 15 ml Jus de citron vert, 30 ml Nectar de cranberry",
            "50 ml Gin, 20 ml Sirop de grenadine, 20 ml Jus de pamplemousse",
            "40 ml Rhum blanc, 20 ml Jus de framboise, 10 ml Citron jaune",
            "50 ml Tequila, 20 ml Nectar de cranberry, 10 ml Lait d'amande"
        ],
        "correctAnswer": 0,
        "explanation": "Recette officielle : 40 ml Vodka citron, 15 ml Triple sec, 15 ml Jus de citron vert, 30 ml Nectar de cranberry. Shaker, servi en Nick & Nora avec un zeste d'orange exprimé."
    },
    {
        "id": "m7_q8",
        "moduleId": 7,
        "badge": "Daiquiri",
        "question": "Quelle est la recette officielle du DAIQUIRI classique ?",
        "options": [
            "50 ml Rhum blanc cubain, 20 ml Jus de citron vert, 15 ml Sirop de sucre",
            "40 ml Rhum ambré, 40 ml Jus d'ananas, 20 ml Lait de coco",
            "50 ml Cachaça, 1 citron vert entier, 2 cuillères de sucre",
            "40 ml Tequila, 20 ml Sirop d'agave, 20 ml Citron vert"
        ],
        "correctAnswer": 0,
        "explanation": "Le Daiquiri : 50 ml Rhum blanc cubain, 20 ml Jus de citron vert, 15 ml Sirop de sucre. Frappé au shaker et servi en Nick & Nora."
    },
    {
        "id": "m7_q9",
        "moduleId": 7,
        "badge": "Caipirinha",
        "question": "Quel spiritueux brésilien constitue la base obligatoire de la CAIPIRINHA ?",
        "options": ["La Cachaça (50 ml)", "Le Pisco", "Le Mezcal", "Le Rhum Agricole"],
        "correctAnswer": 0,
        "explanation": "La Caipirinha se réalise au verre avec 50 ml de Cachaça, 1 citron vert coupé en morceaux et 15 g / 1 bar spoon de sucre en poudre (sur glace pilée)."
    },
    {
        "id": "m7_q10",
        "moduleId": 7,
        "badge": "Espresso Martini",
        "question": "Quelle est la composition de l'ESPRESSO MARTINI ?",
        "options": [
            "40 ml Vodka, 20 ml Liqueur de café, 30 ml Café espresso, 10 ml Sirop de sucre",
            "50 ml Whisky irlandais, 100 ml Café chaud, 30 ml Crème fouettée",
            "40 ml Gin, 20 ml Crème de café, 20 ml Lait",
            "50 ml Rhum ambré, 20 ml Café froid, 20 ml Baileys"
        ],
        "correctAnswer": 0,
        "explanation": "Espresso Martini : 40 ml Vodka, 20 ml Liqueur de café, 30 ml Café espresso, 10 ml Sirop de sucre. Shaker vigoureusement pour créer la mousse onctueuse, garni de 3 grains de café."
    },
    {
        "id": "m7_q11",
        "moduleId": 7,
        "badge": "Gin Basil Smash",
        "question": "Qui a créé le GIN BASIL SMASH et en quelle année à Hambourg ?",
        "options": [
            "Jörg Meyer au bar 'Le Lion' en 2008",
            "Dick Bradsell au 'Fred's Club' en 1984",
            "Victor Bergeron à San Francisco en 1944",
            "Ada Coleman au 'Savoy' en 1903"
        ],
        "correctAnswer": 0,
        "explanation": "Le Gin Basil Smash a été créé par Jörg Meyer au bar « Le Lion • Bar de Paris » à Hambourg (Allemagne) en 2008."
    },
    {
        "id": "m7_q12",
        "moduleId": 7,
        "badge": "Manhattan",
        "question": "Quels sont les composants du MANHATTAN ?",
        "options": [
            "50 ml Rye Whiskey, 20 ml Vermouth rouge, 2 traits Aromatic bitters",
            "50 ml Bourbon, 20 ml Vermouth dry, 1 trait de grenadine",
            "40 ml Cognac, 20 ml Cointreau, 20 ml Jus de citron",
            "50 ml Scotch Whisky, 20 ml Liqueur Drambuie"
        ],
        "correctAnswer": 0,
        "explanation": "Le Manhattan se prépare au verre à mélange avec 50 ml Rye Whiskey, 20 ml Vermouth rouge et 2 traits Aromatic bitters. Servi en Nick & Nora avec une cerise à l'eau-de-vie."
    },
    {
        "id": "m7_q13",
        "moduleId": 7,
        "badge": "Margarita",
        "question": "Quelle est la verrerie et la finition traditionnelle du bord du verre pour la MARGARITA ?",
        "options": [
            "Verre Nick & Nora (ou Coupe/Margarita) givré au sel fin",
            "Verre Highball givré au sucre roux",
            "Chope en cuivre givrée au cacao",
            "Verre Flûte sans aucun givrage"
        ],
        "correctAnswer": 0,
        "explanation": "La Margarita (50 ml Tequila, 20 ml Triple Sec, 20 ml Jus de citron vert) est servie dans un verre préalablement givré au sel fin."
    },
    {
        "id": "m7_q14",
        "moduleId": 7,
        "badge": "Old-Fashioned",
        "question": "En quelle année la première mention de la recette du OLD-FASHIONED est-elle apparue aux États-Unis ?",
        "options": ["1806", "1920", "1954", "1988"],
        "correctAnswer": 0,
        "explanation": "La première recette d'un cocktail Old-Fashioned (cocktail au sens originel : spiritueux, sucre, eau, bitters) fut mise au point aux USA en 1806."
    },
    {
        "id": "m7_q15",
        "moduleId": 7,
        "badge": "Penicillin",
        "question": "Quel ingrédient très tourbé est versé en 'float' (à la surface) sur le PENICILLIN ?",
        "options": [
            "10 ml Scotch Whisky tourbé (Islay Single Malt)",
            "10 ml de Mezcal",
            "10 ml d'Absinthe",
            "10 ml d'Eau gazeuse"
        ],
        "correctAnswer": 0,
        "explanation": "Le Penicillin (créé par Sam Ross en 2005) utilise du Blended Scotch, du citron, du sirop miel-gingembre, et se termine par un float de Scotch tourbé."
    },
    {
        "id": "m7_q16",
        "moduleId": 7,
        "badge": "Pornstar Martini",
        "question": "Quel accompagnement est obligatoirement servi à côté d'un PORNSTAR MARTINI ?",
        "options": [
            "Un shot de Prosecco / vin blanc effervescent (30 ml)",
            "Un verre d'eau plate avec une rondelle de concombre",
            "Un shooter d'espresso bien serré",
            "Une coupelle d'olives vertes farcies"
        ],
        "correctAnswer": 0,
        "explanation": "Le Pornstar Martini (Vodka vanille, Passoa, purée de passion, citron vert, sirop de vanille) est traditionnellement servi avec un shot de Prosecco (30 ml) et un demi fruit de la passion flottant."
    },
    {
        "id": "m7_q17",
        "moduleId": 7,
        "badge": "Sidecar",
        "question": "Quelle est la base alcoolique noble du SIDECAR ?",
        "options": ["Le Cognac (50 ml)", "Le Gin (50 ml)", "Le Rhum blanc (50 ml)", "Le Bourbon (50 ml)"],
        "correctAnswer": 0,
        "explanation": "Le Sidecar est un Short drink classique composé de 50 ml Cognac, 20 ml Triple sec et 20 ml Jus de citron jaune (shaker, verre Nick & Nora)."
    },
    {
        "id": "m7_q18",
        "moduleId": 7,
        "badge": "Americano",
        "question": "Quels sont les composants et la méthode de l'AMERICANO (Long drink) ?",
        "options": [
            "30 ml Campari/Bitter, 30 ml Vermouth rouge, 50 ml Eau gazeuse (Direct au verre Rocks ou Highball)",
            "50 ml Bourbon, 1 café allongé, 20 ml Sirop d'érable",
            "40 ml Gin, 20 ml Vermouth rouge, 100 ml Cola",
            "30 ml Tequila, 30 ml Pamplemousse, 60 ml Bière"
        ],
        "correctAnswer": 0,
        "explanation": "L'Americano : 30 ml Vermouth rouge, 30 ml Bitter, complété d'eau gazeuse (direct au verre Rocks avec tranche d'orange et zeste de citron)."
    },
    {
        "id": "m7_q19",
        "moduleId": 7,
        "badge": "Bellini",
        "question": "Qui a inventé le BELLINI au Harry's Bar de Venise en 1948 ?",
        "options": ["Giuseppe Cipriani", "Fernand Petiot", "Victor Bergeron", "Donn Beach"],
        "correctAnswer": 0,
        "explanation": "Le Bellini (purée de pêche blanche + Prosecco) a été inventé par Giuseppe Cipriani au Harry's Bar de Venise en 1948, nommé d'après le peintre Giovanni Bellini."
    },
    {
        "id": "m7_q20",
        "moduleId": 7,
        "badge": "Bloody Mary",
        "question": "Quels sont les assaisonnements et épices caractéristiques du BLOODY MARY ?",
        "options": [
            "Sel de céleri, poivre noir moulu, sauce Tabasco, sauce Worcestershire et jus de citron",
            "Cannelle en poudre, clou de girofle et noix de muscade",
            "Sirop d'agave, piment doux et menthe fraîche",
            "Curry jaune, curcuma et lait de coco"
        ],
        "correctAnswer": 0,
        "explanation": "Le Bloody Mary assaisonne son jus de tomate avec sel de céleri, poivre, Tabasco, sauce Worcestershire et citron vert/jaune (Vodka 40 ml + Jus de tomate 100 ml)."
    },
    {
        "id": "m7_q21",
        "moduleId": 7,
        "badge": "Dark and Stormy",
        "question": "Quelle marque a déposé la marque du DARK AND STORMY pour garantir l'utilisation de son rhum ambré des Bermudes ?",
        "options": ["Gosling's Black Seal", "Bacardi", "Havana Club", "Captain Morgan"],
        "correctAnswer": 0,
        "explanation": "La famille Gosling a déposé la marque du Dark 'N Stormy en 1991 : 50 ml Rhum ambré Gosling's + 100 ml Ginger Beer + 15 ml Jus de citron vert."
    },
    {
        "id": "m7_q22",
        "moduleId": 7,
        "badge": "French 75",
        "question": "De quoi se compose le FRENCH 75 selon la fiche technique ?",
        "options": [
            "30 ml Gin, 15 ml Jus de citron jaune, 10 ml Sirop de sucre, 60 ml Champagne brut",
            "40 ml Cognac, 20 ml Triple sec, 100 ml Bière blonde",
            "50 ml Vodka, 20 ml Liqueur de framboise, 40 ml Jus d'ananas",
            "30 ml Pastis, 15 ml Sirop d'orgeat, 60 ml Eau gazeuse"
        ],
        "correctAnswer": 0,
        "explanation": "Le French 75 : 30 ml Gin, 15 ml Jus de citron jaune, 10 ml Sirop de sucre, complété de 60 ml Champagne brut en verre Flûte."
    },
    {
        "id": "m7_q23",
        "moduleId": 7,
        "badge": "Horse's Neck",
        "question": "Quelle est la garniture spectaculaire emblématique du HORSE'S NECK ?",
        "options": [
            "Un long zeste de citron jaune taillé en spirale continue placé dans le verre Highball",
            "Trois brochettes d'olives noires",
            "Une tranche d'ananas flambée",
            "Une fleur d'orchidée comestible"
        ],
        "correctAnswer": 0,
        "explanation": "Le Horse's Neck (Cognac ou Bourbon + Ginger Ale + Angostura) est caractérisé par son long ruban / serpentin de zeste de citron ('cou de cheval')."
    },
    {
        "id": "m7_q24",
        "moduleId": 7,
        "badge": "Mai Tai",
        "question": "Qui est le créateur légendaire du MAI TAI en 1944 ?",
        "options": [
            "Victor Bergeron, dit « Trader Vic »",
            "Harry MacElhone",
            "Ernest Hemingway",
            "Jerry Thomas"
        ],
        "correctAnswer": 0,
        "explanation": "Le Mai Tai a été créé par Victor Bergeron (« Trader Vic ») à San Francisco / Oakland en 1944, figure majeure de la culture Tiki."
    },
    {
        "id": "m7_q25",
        "moduleId": 7,
        "badge": "Mojito",
        "question": "Quelle est la signification du mot « MOJITO » en espagnol d'après son historique officiel ?",
        "options": ["« Petit jus »", "« Feuille magique »", "« Vent du sud »", "« Sucre glacé »"],
        "correctAnswer": 0,
        "explanation": "Mojito provient de 'mojo' et signifie « petit jus » en espagnol. Première publication à Cuba dans le 'Libro de Cocktail' en 1929."
    },
    {
        "id": "m7_q26",
        "moduleId": 7,
        "badge": "Moscow Mule",
        "question": "Dans quel verre/récipient sert-on impérativement un MOSCOW MULE traditionnel ?",
        "options": ["Une timbale Mule en cuivre (ou verre Mule)", "Une coupe en cristal", "Un verre à martini", "Un bocal Mason jar"],
        "correctAnswer": 0,
        "explanation": "Le Moscow Mule (Vodka + Ginger Beer + Jus de citron vert) se sert dans une timbale Mule en cuivre avec de la glace."
    },
    {
        "id": "m7_q27",
        "moduleId": 7,
        "badge": "Paloma",
        "question": "Que signifie le mot espagnol « PALOMA » ?",
        "options": ["Colombe", "Soleil", "Palmier", "Papillon"],
        "correctAnswer": 0,
        "explanation": "Paloma signifie « colombe » en espagnol. C'est un Long drink originaire de la région de Guadalajara au Mexique (Tequila, citron vert, agave, pamplemousse, eau gazeuse)."
    },
    {
        "id": "m7_q28",
        "moduleId": 7,
        "badge": "Piña Colada",
        "question": "À qui attribue-t-on la création de la PIÑA COLADA en 1954 à l'hôtel Hilton de San Juan à Porto Rico ?",
        "options": [
            "Ramon Marrero Perez, surnommé « Monchito »",
            "Don Facundo Bacardi",
            "Ada Coleman",
            "Hugo Ensslin"
        ],
        "correctAnswer": 0,
        "explanation": "La création de la Piña Colada est attribuée à Ramon Marrero Perez (« Monchito ») à l'hôtel Caribe Hilton de San Juan en 1954."
    },
    {
        "id": "m7_q29",
        "moduleId": 7,
        "badge": "Planter's Punch",
        "question": "Quelle est la particularité de finition du PLANTER'S PUNCH lors de son élaboration au verre ?",
        "options": [
            "On verse tous les ingrédients, on mélange, puis on ajoute 1 trait de rhum agricole ambré en surface SANS mélanger",
            "On verse une boule de glace vanille sur le cocktail",
            "On flambe le verre avec du cognac",
            "On le sert bouillant"
        ],
        "correctAnswer": 0,
        "explanation": "Dans la technique officielle : on mélange rhum blanc, jus d'ananas, jus d'orange et bitters, puis on ajoute 1 trait de rhum agricole ambré en float sans mélanger."
    },
    {
        "id": "m7_q30",
        "moduleId": 7,
        "badge": "Rum Swizzle",
        "question": "Quel outil traditionnel à 5 branches naturelles est utilisé pour brasser le RUM SWIZZLE ?",
        "options": [
            "Le Bois Lélé (Swizzle stick)",
            "Un fouet à matcha en bambou",
            "Une spatule en silicone",
            "Une branche de cannelle entière"
        ],
        "correctAnswer": 0,
        "explanation": "Le Swizzle stick (bâton lélé) est une ramification naturelle à 5 branches des Caraïbes qui permet de faire tourner le mélange sur glace pilée entre ses paumes."
    },
    {
        "id": "m7_q31",
        "moduleId": 7,
        "badge": "Sex on the Beach",
        "question": "Quels sont les ingrédients exacts du SEX ON THE BEACH (Long drink) ?",
        "options": [
            "40 ml Vodka, 10 ml Liqueur de pêche, 40 ml Nectar de cranberry, 40 ml Jus d'orange",
            "50 ml Rhum, 20 ml Sirop de fraise, 80 ml Jus de goyave",
            "40 ml Gin, 20 ml Curaçao bleu, 60 ml Tonic",
            "50 ml Tequila, 20 ml Sirop de grenadine, 80 ml Jus d'ananas"
        ],
        "correctAnswer": 0,
        "explanation": "Recette officielle : 40 ml Vodka, 10 ml Liqueur de pêche, 40 ml Nectar de cranberry, 40 ml Jus d'orange. Shaker puis verre Highball avec demi-tranche d'orange."
    },
    {
        "id": "m7_q32",
        "moduleId": 7,
        "badge": "Spritz",
        "question": "Quelle est la proportion officielle du SPRITZ dans le référentiel ?",
        "options": [
            "50 ml Bitter / Spiritueux amer, 60 ml Vin blanc effervescent (Prosecco), 20 ml Eau gazeuse",
            "30 ml Vodka, 100 ml Soda au citron, 10 ml Grenadine",
            "50 ml Pastis, 50 ml Sirop de menthe, 50 ml Eau",
            "70 ml Gin, 70 ml Tonic, 10 ml Citron vert"
        ],
        "correctAnswer": 0,
        "explanation": "Fiche Spritz officielle : 50 ml Bitter ou autre spiritueux, 60 ml Vin blanc effervescent (Prosecco privilégié), 20 ml Eau gazeuse. Servi en verre à vin sur glace."
    },
    {
        "id": "m7_q33",
        "moduleId": 7,
        "badge": "Tequila Sunrise",
        "question": "Quel célèbre groupe de rock a popularisé la version moderne de la TEQUILA SUNRISE lors de sa tournée en 1972 ?",
        "options": ["The Rolling Stones", "The Beatles", "Queen", "Led Zeppelin"],
        "correctAnswer": 0,
        "explanation": "La version moderne de la Tequila Sunrise a été mise au point en 1972 et popularisée par les Rolling Stones durant leur tournée américaine."
    },

    # ==================== MODULE 8 : CALCUL DU TAV ====================
    {
        "id": "m8_q1",
        "moduleId": 8,
        "badge": "Définition TAV",
        "question": "Que signifie le sigle « TAV » dans le vocabulaire officiel du bar ?",
        "options": [
            "Titre Alcoométrique Volumique",
            "Temps d'Action du Vermouth",
            "Teneur en Alcool et Vinaigre",
            "Total Alcoolique du Verre"
        ],
        "correctAnswer": 0,
        "explanation": "TAV signifie Titre Alcoométrique Volumique, exprimé en pourcentage du volume d'alcool pur rapporté au volume total du cocktail."
    },
    {
        "id": "m8_q2",
        "moduleId": 8,
        "badge": "Formule de calcul",
        "question": "Quelle est la formule générale pour calculer le TAV global d'un cocktail composé de plusieurs ingrédients ?",
        "options": [
            "Somme des (Volume en ml × Degré d'alcool) ÷ Volume total du cocktail en ml",
            "Somme des degrés d'alcool divisée par le nombre de bouteilles",
            "Volume total du cocktail multiplié par le prix de vente",
            "Degré de l'ingrédient le plus fort divisé par 2"
        ],
        "correctAnswer": 0,
        "explanation": "Pour calculer le TAV : on calcule pour chaque ingrédient Volume × Degré, on additionne tous les résultats, puis on divise par le volume total du cocktail."
    },
    {
        "id": "m8_q3",
        "moduleId": 8,
        "badge": "Exemple officiel Americano",
        "question": "Dans l'exemple officiel du cocktail Americano (20 ml Vermouth rouge à 14,5% + 50 ml Bitter à 25% + 50 ml Eau gazeuse à 0%), quel est le calcul exact du TAV ?",
        "options": [
            "(290 + 1250 + 0) = 1540  puis  1540 ÷ 120 ml = 12,83 % (arrondi à 13 %)",
            "(20 + 50 + 50) ÷ 3 = 40 %",
            "(14,5 + 25) ÷ 2 = 19,75 %",
            "120 × 25 % = 30 %"
        ],
        "correctAnswer": 0,
        "explanation": "20 × 14,5 = 290 | 50 × 25 = 1250 | 50 × 0 = 0. Total = 1540. Contenance totale = 120 ml. 1540 ÷ 120 = 12,83% soit un TAV d'environ 13%."
    },
    {
        "id": "m8_q4",
        "moduleId": 8,
        "badge": "Calcul Pratique",
        "question": "Si vous servez 50 ml de Vodka titrant à 40% vol avec 150 ml de jus d'orange (0% vol), quel est le TAV du cocktail (volume total 200 ml) ?",
        "options": ["10 %", "20 %", "40 %", "5 %"],
        "correctAnswer": 0,
        "explanation": "(50 ml × 40) + (150 ml × 0) = 2000. Volume total = 200 ml. 2000 ÷ 200 = 10 %."
    },
    {
        "id": "m8_q5",
        "moduleId": 8,
        "badge": "Alcool Pur",
        "question": "Combien de millilitres d'alcool pur contient une dose de 40 ml de Gin à 40% vol ?",
        "options": ["16 ml d'alcool pur", "40 ml d'alcool pur", "10 ml d'alcool pur", "4 ml d'alcool pur"],
        "correctAnswer": 0,
        "explanation": "40 ml × (40 / 100) = 16 ml d'alcool pur."
    },
    {
        "id": "m8_q6",
        "moduleId": 8,
        "badge": "Responsabilité",
        "question": "Pourquoi la maîtrise du calcul du TAV est-elle exigée dans le référentiel de formation ?",
        "options": [
            "Pour adapter l'offre à une consommation responsable et informer précisément les clients sur la puissance alcoolique",
            "Pour payer des taxes supplémentaires sur chaque verre servi",
            "Pour déterminer obligatoirement la couleur du cocktail",
            "Pour accélérer la fonte des glaçons"
        ],
        "correctAnswer": 0,
        "explanation": "La connaissance du TAV permet de veiller à la santé publique, au respect de la législation et à la promotion d'une consommation responsable."
    },

    # ==================== MODULE 9 : LEXIQUE PROFESSIONNEL ====================
    {
        "id": "m9_q1",
        "moduleId": 9,
        "badge": "Albédos",
        "question": "Qu'est-ce que l'« ALBÉDOS » (parfois appelé 'ziste') selon le lexique ?",
        "options": [
            "La partie intérieure blanche et amère de l'écorce d'un agrume",
            "Un cocktail sans alcool à base de concombre",
            "Le nom commercial d'un bitter italien",
            "La mousse blanche produite par le blanc d'œuf"
        ],
        "correctAnswer": 0,
        "explanation": "L'ALBÉDOS est la partie intérieure blanche de l'écorce d'un agrume (souvent très amère, qu'il convient de retirer lors des zestes)."
    },
    {
        "id": "m9_q2",
        "moduleId": 9,
        "badge": "Aquafaba",
        "question": "Qu'est-ce que l'« AQUAFABA » et à quoi sert-il au bar ?",
        "options": [
            "Le jus de cuisson de pois chiche, utilisé comme émulsifiant végétal alternatif au blanc d'œuf",
            "Une liqueur brésilienne à base de fèves de cacao",
            "Une eau minérale pétillante d'origine espagnole",
            "Un sel aromatisé aux herbes pour givrer les verres"
        ],
        "correctAnswer": 0,
        "explanation": "L'AQUAFABA désigne le jus de pois chiche utilisé au bar comme émulsifiant (alternative vegan au blanc d'œuf) pour créer une mousse onctueuse."
    },
    {
        "id": "m9_q3",
        "moduleId": 9,
        "badge": "Cuban Roll",
        "question": "En quoi consiste la technique du « CUBAN ROLL » (autrefois appelée 'throwing') ?",
        "options": [
            "Transvaser les liquides d'une timbale à une autre avec un grand jet afin de les oxygéner et de les rafraîchir en limitant la dilution",
            "Faire tourner le shaker sur le plancher du bar",
            "Écraser des feuilles de menthe au pilon dans une timbale",
            "Rouler un cigare cubain autour du pied du verre"
        ],
        "correctAnswer": 0,
        "explanation": "Le Cuban Roll (throwing) consiste à transvaser les liquides avec une passoire d'une timbale à une autre tenue à distance pour aérer et rafraîchir le cocktail."
    },
    {
        "id": "m9_q4",
        "moduleId": 9,
        "badge": "Dry Shake",
        "question": "Qu'est-ce qu'un « DRY SHAKE » ?",
        "options": [
            "Frapper une première fois au shaker SANS GLACE avec un émulsifiant (blanc d'œuf, aquafaba) pour créer l'émulsion",
            "Shaker sans aucun liquide dans la timbale",
            "Servir un cocktail sans verre",
            "Utiliser uniquement du vermouth dry dans le shaker"
        ],
        "correctAnswer": 0,
        "explanation": "Le DRY SHAKE consiste à frapper les ingrédients sans glaçons avec l'émulsifiant afin de développer une texture mousseuse avant d'ajouter la glace."
    },
    {
        "id": "m9_q5",
        "moduleId": 9,
        "badge": "Reverse Dry Shake",
        "question": "Qu'est-ce que le « REVERSE DRY SHAKE » ?",
        "options": [
            "Frapper d'abord AVEC glace, filtrer les glaçons, puis frapper une seconde fois SANS glace avec l'émulsifiant",
            "Frapper le shaker à l'envers",
            "Boire le cocktail à la paille avant de le secouer",
            "Mélanger à la cuillère puis frapper au blender"
        ],
        "correctAnswer": 0,
        "explanation": "Le Reverse Dry Shake consiste à frapper une 2e fois sans glace après avoir refroidi le mélange, pour maximiser le volume et la tenue de la mousse."
    },
    {
        "id": "m9_q6",
        "moduleId": 9,
        "badge": "Exprimer",
        "question": "Que signifie le verbe « EXPRIMER » dans le domaine du bar ?",
        "options": [
            "Presser et plier un zeste d'agrume au-dessus du verre pour en libérer les huiles essentielles parfumées",
            "Demander au client ses goûts préférés",
            "Calculer le degré d'alcool à voix haute",
            "Faire passer le cocktail à travers une passoire fine"
        ],
        "correctAnswer": 0,
        "explanation": "EXPRIMER : libérer les essences aromatiques contenues dans les alvéoles de l'écorce (zeste) d'un agrume à la surface du cocktail."
    },
    {
        "id": "m9_q7",
        "moduleId": 9,
        "badge": "Float",
        "question": "Que signifie faire un « FLOAT » ?",
        "options": [
            "Verser délicatement un filet de liquide à la surface d'un cocktail sans le mélanger",
            "Faire flotter un canard en plastique dans le cocktail",
            "Ajouter de la glace pilée jusqu'en haut",
            "Nettoyer le bar à grande eau"
        ],
        "correctAnswer": 0,
        "explanation": "FLOAT : action de verser un liquide moins dense (ou à la cuillère) au-dessus d'un cocktail pour qu'il reste en nappe à la surface sans se mélanger."
    },
    {
        "id": "m9_q8",
        "moduleId": 9,
        "badge": "Muter",
        "question": "Que signifie l'action de « MUTER » en œnologie et mixologie ?",
        "options": [
            "Empêcher ou stopper la fermentation alcoolique par l'ajout d'un alcool afin de conserver les sucres naturels",
            "Changer le nom d'un cocktail quand il est réinventé",
            "Passer un cocktail au blender à puissance maximale",
            "Remplacer le gin par de la vodka"
        ],
        "correctAnswer": 0,
        "explanation": "MUTER : stopper la fermentation alcoolique des levures en ajoutant de l'alcool pur ou une eau-de-vie (ex: pour fabriquer les vins doux naturels, Pineau, Porto...)."
    },
    {
        "id": "m9_q9",
        "moduleId": 9,
        "badge": "Fat Washing",
        "question": "En quoi consiste la technique du « FAT WASHING » ?",
        "options": [
            "Aromatiser un alcool à partir d'un corps gras (beurre noisette, huile de sésame, graisse de canard...) puis le figer au froid et le filtrer",
            "Nettoyer les timbales de shaker avec du savon dégraissant",
            "Ajouter du fromage râpé dans le shaker",
            "Laver les verres à l'eau très chaude"
        ],
        "correctAnswer": 0,
        "explanation": "FAT WASHING : technique consistant à infuser un alcool avec un corps gras liquide puis à congeler le mélange pour figer et retirer le gras, laissant un arôme riche et soyeux."
    },
    {
        "id": "m9_q10",
        "moduleId": 9,
        "badge": "No Low",
        "question": "Que désigne l'expression « NO LOW » ?",
        "options": [
            "La contraction de 'No Alcohol' et 'Low Alcohol by volume', désignant les cocktails sans alcool ou à très faible degré d'alcool",
            "Un cocktail sans sucre et sans glaçons",
            "Un bar sans musique et sans lumière vive",
            "Une méthode pour ne jamais remplir les verres à ras bord"
        ],
        "correctAnswer": 0,
        "explanation": "NO LOW : contraction anglaise 'no alcohol' et 'low ABV', tendance de fond pour une consommation modérée et responsable."
    },
    {
        "id": "m9_q11",
        "moduleId": 9,
        "badge": "Trait (Dash)",
        "question": "Combien de gouttes environ représente la mesure officielle d'un « TRAIT » (dash) ?",
        "options": ["Environ 3 à 5 gouttes", "Environ 50 gouttes", "Une cuillère à soupe (15 ml)", "Une seule gouttelette microscopique"],
        "correctAnswer": 0,
        "explanation": "TRAIT (dash) : terme de mesure représentant environ 3 à 5 gouttes (soit environ 0,5 à 1 ml)."
    },
    {
        "id": "m9_q12",
        "moduleId": 9,
        "badge": "Mesure standard",
        "question": "Dans le standard français de bar, quel volume en millilitres représente le terme « UNE MESURE » ?",
        "options": ["40 ml (4 cl)", "20 ml (2 cl)", "60 ml (6 cl)", "100 ml (10 cl)"],
        "correctAnswer": 0,
        "explanation": "MESURE : terme officiel désignant un volume standard français de 40 ml (4 cl)."
    }
]

# --- 3. COCKTAILS DATABASE (FOR MEMO CARDS EXPLORER) ---
COCKTAILS_DB = [
    {
        "id": "aviation",
        "name": "Aviation",
        "category": "Short drink",
        "type": "All Day Cocktail",
        "glass": "Nick & Nora",
        "method": "Shaker",
        "tav": "24 %",
        "profile": "Floral, acidulé et fruité",
        "ingredients": [
            "40 ml Gin",
            "15 ml Marasquin",
            "15 ml Jus de citron jaune",
            "5 ml Crème de violette"
        ],
        "garnish": "Cerise à l'eau-de-vie",
        "ice": "Sans glace dans le verre rafraîchi",
        "history": "Publié dans « Recipes for mixed drinks » par Hugo Ensslin à New York en 1916.",
        "technique": "Mirer et rafraîchir le verre Nick & Nora. Remplir la grande timbale de glace. Verser les ingrédients dans la petite timbale. Égoutter, frapper 7-10s et passer dans le verre rafraîchi. Garnir d'une cerise à l'eau-de-vie."
    },
    {
        "id": "bamboo",
        "name": "Bamboo",
        "category": "Short drink",
        "type": "Before Dinner",
        "glass": "Nick & Nora",
        "method": "Verre à mélange",
        "tav": "17 %",
        "profile": "Vineux, sec et parfumé",
        "ingredients": [
            "35 ml Sherry Fino",
            "35 ml Vermouth Dry",
            "2 traits Bitters orange",
            "1 trait Aromatic bitters"
        ],
        "garnish": "Zeste de citron jaune exprimé",
        "ice": "Sans glace",
        "history": "Créé à la fin du XIXe siècle à Yokohama au Japon par Louis Eppinger.",
        "technique": "Mirer et rafraîchir le verre. Rafraîchir le verre à mélange avec glace, égoutter. Verser les ingrédients, mélanger 15-20s à la cuillère, passer dans le verre rafraîchi."
    },
    {
        "id": "bramble",
        "name": "Bramble",
        "category": "Short drink",
        "type": "All Day Cocktail",
        "glass": "Rocks",
        "method": "Direct au verre / Shaker",
        "tav": "19 %",
        "profile": "Fruité, acidulé et gourmand",
        "ingredients": [
            "40 ml Gin",
            "20 ml Jus de citron jaune",
            "10 ml Sirop de sucre",
            "15 ml Crème de mûre (en float)"
        ],
        "garnish": "Mûres fraîches et demi-tranche de citron",
        "ice": "Glace pilée",
        "history": "Créé par Dick Bradsell à Londres en 1984 au Fred's Club.",
        "technique": "Frapper gin, citron et sirop. Verser sur glace pilée dans le verre Rocks. Verser la crème de mûre en float au sommet."
    },
    {
        "id": "caipirinha",
        "name": "Caipirinha",
        "category": "Short drink",
        "type": "All Day Cocktail",
        "glass": "Rocks",
        "method": "Direct au verre",
        "tav": "24 %",
        "profile": "Puissant, acidulé et frais",
        "ingredients": [
            "50 ml Cachaça",
            "1 Citron vert entier (coupé en dés)",
            "1 Bar spoon Sucre poudre extra fin (15 g)"
        ],
        "garnish": "Quartiers de citron vert dans le verre",
        "ice": "Glace pilée",
        "history": "Boisson nationale du Brésil, originaire de l'État de São Paulo vers 1918.",
        "technique": "Piler le citron vert et le sucre dans le verre Rocks. Remplir de glace pilée. Verser la Cachaça, mélanger intimement à la cuillère de bar."
    },
    {
        "id": "cosmopolitan",
        "name": "Cosmopolitan",
        "category": "Short drink",
        "type": "All Day Cocktail",
        "glass": "Nick & Nora",
        "method": "Shaker",
        "tav": "20 %",
        "profile": "Fruité, acidulé et gourmand",
        "ingredients": [
            "40 ml Vodka citron",
            "15 ml Triple sec (Cointreau)",
            "15 ml Jus de citron vert",
            "30 ml Nectar de cranberry"
        ],
        "garnish": "Zeste d'orange exprimé",
        "ice": "Sans glace",
        "history": "Popularisé dans les années 1980-90 aux USA par Toby Cecchini et Cheryl Cook.",
        "technique": "Frapper tous les ingrédients au shaker avec des glaçons pendant 7 à 10s. Passer dans un verre Nick & Nora rafraîchi. Exprimer un zeste d'orange."
    },
    {
        "id": "daiquiri",
        "name": "Daiquiri",
        "category": "Short drink",
        "type": "Before Dinner",
        "glass": "Nick & Nora",
        "method": "Shaker",
        "tav": "22 %",
        "profile": "Puissant, acidulé et frais",
        "ingredients": [
            "50 ml Rhum blanc cubain",
            "20 ml Jus de citron vert",
            "15 ml Sirop de sucre"
        ],
        "garnish": "Tranche ou zeste de citron vert",
        "ice": "Sans glace",
        "history": "Créé à Cuba vers 1898 par l'ingénieur américain Jennings Cox dans la ville minière de Daiquirí.",
        "technique": "Frapper vigoureusement les ingrédients au shaker avec glaçons. Passer dans un verre Nick & Nora rafraîchi."
    },
    {
        "id": "dry-martini",
        "name": "Dry Martini",
        "category": "Short drink",
        "type": "Before Dinner",
        "glass": "Nick & Nora / Martini",
        "method": "Verre à mélange",
        "tav": "33 %",
        "profile": "Puissant, vineux et sec",
        "ingredients": [
            "50 ml Gin",
            "10 ml Vermouth Dry",
            "1 trait Bitters orange (facultatif)"
        ],
        "garnish": "Olive verte ou Zeste de citron exprimé",
        "ice": "Sans glace",
        "history": "Évolution du Martinez (1884). Publié par Frank Newman à Paris en 1904.",
        "technique": "Mélanger au verre à mélange avec glaçons pendant 15 à 20s. Passer dans le verre de service rafraîchi."
    },
    {
        "id": "espresso-martini",
        "name": "Espresso Martini",
        "category": "Short drink",
        "type": "After Dinner",
        "glass": "Nick & Nora / Coupe",
        "method": "Shaker",
        "tav": "18 %",
        "profile": "Corsé, complexe et gourmand",
        "ingredients": [
            "40 ml Vodka",
            "20 ml Liqueur de café (Kahlúa)",
            "30 ml Café espresso chaud",
            "10 ml Sirop de sucre"
        ],
        "garnish": "3 grains de café déposés sur la mousse",
        "ice": "Sans glace",
        "history": "Créé par Dick Bradsell à Londres en 1983 à la demande d'un mannequin célèbre.",
        "technique": "Frapper énergiquement au shaker pour former une mousse dense (créma). Passer dans le verre rafraîchi."
    },
    {
        "id": "gin-basil-smash",
        "name": "Gin Basil Smash",
        "category": "Short drink",
        "type": "All Day Cocktail",
        "glass": "Rocks",
        "method": "Shaker",
        "tav": "20 %",
        "profile": "Frais, acidulé et végétal",
        "ingredients": [
            "50 ml Gin",
            "25 ml Jus de citron jaune",
            "15 ml Sirop de sucre",
            "8 à 10 Feuilles de basilic frais"
        ],
        "garnish": "Tête de basilic frais",
        "ice": "Glaçons entiers",
        "history": "Créé par Jörg Meyer au bar 'Le Lion' à Hambourg en 2008.",
        "technique": "Piler doucement le basilic avec le citron et le sucre. Ajouter le gin et la glace. Frapper énergiquement et double-filtrer dans le verre Rocks rempli de glace."
    },
    {
        "id": "manhattan",
        "name": "Manhattan",
        "category": "Short drink",
        "type": "Before Dinner",
        "glass": "Nick & Nora",
        "method": "Verre à mélange",
        "tav": "28 %",
        "profile": "Puissant, vineux et complexe",
        "ingredients": [
            "50 ml Rye Whiskey",
            "20 ml Vermouth rouge",
            "2 traits Aromatic bitters"
        ],
        "garnish": "Cerise à l'eau-de-vie (Marasquin)",
        "ice": "Sans glace",
        "history": "Créé au Manhattan Club de New York vers 1874.",
        "technique": "Mélanger au verre à mélange avec des glaçons pendant 15 à 20s. Passer dans un verre Nick & Nora rafraîchi."
    },
    {
        "id": "margarita",
        "name": "Margarita",
        "category": "Short drink",
        "type": "Before Dinner",
        "glass": "Nick & Nora / Coupe",
        "method": "Shaker",
        "tav": "25 %",
        "profile": "Puissant, acidulé et frais",
        "ingredients": [
            "50 ml Tequila Blanco (100% agave)",
            "20 ml Triple sec",
            "20 ml Jus de citron vert"
        ],
        "garnish": "Givrage au sel fin sur le bord du verre et rondelle de citron vert",
        "ice": "Sans glace",
        "history": "Créé au Mexique à la fin des années 1930 / 1940 (plusieurs créateurs revendiqués).",
        "technique": "Givrer le bord du verre au sel fin. Frapper les ingrédients au shaker avec glace et passer dans le verre rafraîchi."
    },
    {
        "id": "negroni",
        "name": "Negroni",
        "category": "Short drink",
        "type": "Before Dinner",
        "glass": "Rocks",
        "method": "Verre à mélange / Direct",
        "tav": "24 %",
        "profile": "Puissant, vineux et amer",
        "ingredients": [
            "30 ml Gin",
            "30 ml Vermouth rouge",
            "30 ml Bitter (Campari)"
        ],
        "garnish": "Demi-tranche d'orange ou Zeste d'orange exprimé",
        "ice": "Gros glaçons",
        "history": "Créé à Florence vers 1919 pour le comte Camillo Negroni au Caffè Casoni.",
        "technique": "Mélanger au verre à mélange avec glace puis passer dans le verre Rocks rempli de glace fraîche."
    },
    {
        "id": "old-fashioned",
        "name": "Old-Fashioned",
        "category": "Short drink",
        "type": "All Day Cocktail",
        "glass": "Rocks",
        "method": "Direct au verre",
        "tav": "33 %",
        "profile": "Puissant, boisé et complexe",
        "ingredients": [
            "50 ml Bourbon ou Rye Whiskey (ou Eau-de-vie brune)",
            "1 Morceau de sucre brun (ou 5 ml de sirop)",
            "2 traits Aromatic bitters",
            "1 trait d'eau ou soda pour dissoudre"
        ],
        "garnish": "Zeste d'orange exprimé et cerise à l'eau-de-vie",
        "ice": "Gros glaçons",
        "history": "Le cocktail original par excellence, défini dès 1806 aux États-Unis.",
        "technique": "Imbiber le sucre de bitters dans le verre Rocks, dissoudre avec un trait d'eau. Remplir de glaçons, verser l'eau-de-vie en 2 fois en remuant délicatement."
    },
    {
        "id": "mojito",
        "name": "Mojito",
        "category": "Long drink",
        "type": "All Day Cocktail",
        "glass": "Highball",
        "method": "Direct au verre",
        "tav": "12 %",
        "profile": "Frais, acidulé et désaltérant",
        "ingredients": [
            "50 ml Ron cubain blanc",
            "20 ml Jus de citron vert",
            "1 Bar spoon Sucre poudre extra fin",
            "6 à 8 Feuilles de menthe fraîche",
            "30 à 40 ml Eau gazeuse fraîche"
        ],
        "garnish": "Tranche de citron vert et belle tête de menthe fraîche",
        "ice": "Glaçons entiers",
        "history": "Cocktail emblématique de Cuba, publié en 1929 dans 'Libro de Cocktail'.",
        "technique": "Piler très délicatement la menthe et le sucre avec le citron vert. Remplir de glace. Verser le rhum et l'eau gazeuse, mélanger de bas en haut."
    },
    {
        "id": "moscow-mule",
        "name": "Moscow Mule",
        "category": "Long drink",
        "type": "All Day Cocktail",
        "glass": "Timbale Mule en cuivre",
        "method": "Direct au verre",
        "tav": "13 %",
        "profile": "Frais, acidulé et épicé",
        "ingredients": [
            "40 ml Vodka",
            "15 ml Jus de citron vert",
            "100 ml Ginger Beer (bière de gingembre)",
            "2 traits Aromatic bitters (facultatif)"
        ],
        "garnish": "Tranche de citron vert et tête de menthe",
        "ice": "Glaçons",
        "history": "Créé en 1941 aux USA par le propriétaire de Smirnoff et du restaurant Cock 'n Bull.",
        "technique": "Remplir la timbale Mule de glace. Verser la vodka et le jus de citron vert. Compléter de Ginger Beer fraîche. Remuer délicatement."
    },
    {
        "id": "pina-colada",
        "name": "Piña Colada",
        "category": "Long drink",
        "type": "All Day Cocktail",
        "glass": "Highball / Hurricane",
        "method": "Shaker / Blender",
        "tav": "13 %",
        "profile": "Exotique, fruité et gourmand",
        "ingredients": [
            "40 ml Rhum blanc",
            "60 ml Jus d'ananas",
            "20 ml Crème de noix de coco"
        ],
        "garnish": "Quartier d'ananas et cerise à l'eau-de-vie",
        "ice": "Glaçons",
        "history": "Créé par Ramon 'Monchito' Marrero au Caribe Hilton de Porto Rico en 1954.",
        "technique": "Frapper énergiquement au shaker (ou mixer au blender) avec glace. Passer dans le verre rempli de glace fraîche."
    },
    {
        "id": "spritz",
        "name": "Spritz",
        "category": "Long drink",
        "type": "Before Dinner",
        "glass": "Verre à Vin",
        "method": "Direct au verre",
        "tav": "14 %",
        "profile": "Fruité, vineux et désaltérant",
        "ingredients": [
            "50 ml Bitter (Aperol ou Campari)",
            "60 ml Vin blanc effervescent (Prosecco)",
            "20 ml Eau gazeuse"
        ],
        "garnish": "Demi-tranche d'orange et olive (selon tradition)",
        "ice": "Plein de glaçons",
        "history": "Originaire de la région de Venise au XIXe siècle, devenu boisson culte apéritive.",
        "technique": "Remplir le verre à vin de glace. Verser le Prosecco, le Bitter puis le trait d'eau gazeuse pour éviter que le bitter ne tombe au fond. Remuer un tour."
    }
]

# --- 4. LEXIQUE ENTRIES ---
LEXIQUE_DB = [
    {"term": "Albédos", "def": "Partie intérieure blanche de l'écorce d'un agrume, parfois appelée « ziste », généralement amère."},
    {"term": "Aquafaba", "def": "Jus de cuisson de pois chiche utilisé au bar comme émulsifiant végétal pour remplacer le blanc d'œuf."},
    {"term": "Aromatic Bitters", "def": "Amer concentré aromatisé utilisé par traits pour apporter amertume et complexité (ex: Angostura)."},
    {"term": "Bartender", "def": "Terme unisexe américain désignant à la fois le barman et la barmaid."},
    {"term": "Bar Spoon", "def": "Cuillère de bar à long manche torsadé permettant de mélanger délicatement et de mesurer."},
    {"term": "Bar Mat", "def": "Tapis de bar en caoutchouc antidérapant pour égoutter les verres et retenir les éclaboussures."},
    {"term": "Bowl", "def": "Récipient de grand volume (vasque/bol) utilisé pour le service des familles de cocktail comme le Punch ou Tiki."},
    {"term": "Cuban Roll", "def": "Technique (throwing) consistant à transvaser les liquides d'une timbale à une autre pour aérer et rafraîchir."},
    {"term": "Collins", "def": "Famille de cocktails Long drink ayant la même composition qu'un Fizz, mais réalisée directement au verre."},
    {"term": "Compléter (Topped)", "def": "Allonger un cocktail d'un complément gazeux (soda, eau gazeuse, bière de gingembre, champagne...)."},
    {"term": "Daisy", "def": "Short drink réalisé au shaker composé d'eau-de-vie, jus de citron, curaçao et eau gazeuse."},
    {"term": "Décoction", "def": "Procédé d'extraction à chaud recommandé pour les racines et écorces peu solubles."},
    {"term": "Distillation", "def": "Procédé de séparation et concentration alcoolique par chauffage des vapeurs et condensation (distillat)."},
    {"term": "Double Filtration", "def": "(Double strain) Filtrer le cocktail avec la passoire fine en plus de la passoire à cocktail pour ôter pulpes et éclats de glace."},
    {"term": "Dry Shake", "def": "Frapper une première fois sans glace avec un émulsifiant (blanc d'œuf, aquafaba) pour monter la mousse."},
    {"term": "Exprimer", "def": "Pincer un zeste d'agrume pour en projeter les essences d'huiles essentielles sur le cocktail."},
    {"term": "Eau-de-vie", "def": "Boisson alcoolique obtenue par distillation de produits fermentés (céréales, fruits, canne...)."},
    {"term": "Fat Washing", "def": "Technique qui consiste à aromatiser un alcool à partir d'un corps gras puis à le figer au froid."},
    {"term": "Fermentation alcoolique", "def": "Transformation des sucres en éthanol et CO2 sous l'action biologique des levures."},
    {"term": "Flip", "def": "Short drink composé d'un jaune d'œuf, d'une base de vin/spiritueux et de noix de muscade râpée."},
    {"term": "Float", "def": "Verser délicatement un filet de liquide à la surface d'un cocktail sans le mélanger au reste."},
    {"term": "Frapper", "def": "Action d'agiter vigoureusement le shaker avec des glaçons."},
    {"term": "Frozen", "def": "Cocktail réalisé au blender avec glace pilée pour obtenir une texture granitée onctueuse."},
    {"term": "Givrer (Rim)", "def": "Créer une collerette de sel, sucre ou épices sur le rebord du verre."},
    {"term": "Highball", "def": "Verre haut et fin ou famille de long drink composé d'eau-de-vie et allongée de soda."},
    {"term": "Hot Drink", "def": "Cocktail servi chaud (ex: Irish Coffee, Grog, Hot Toddy)."},
    {"term": "Infusion", "def": "Procédé d'extraction d'arômes dans un liquide à chaud."},
    {"term": "Jigger", "def": "Doseur gradué en métal ou verre servant à mesurer les volumes avec exactitude."},
    {"term": "Macération", "def": "Procédé d'extraction d'arômes dans un liquide à froid."},
    {"term": "Mélanger (Stir)", "def": "Remuer une boisson avec la cuillère de bar dans le verre à mélange."},
    {"term": "Mesure", "def": "Volume standard français de 40 ml (4 cl)."},
    {"term": "Mocktail", "def": "Cocktail sans alcool (du verbe anglais 'mock' : imiter)."},
    {"term": "Muter", "def": "Stopper la fermentation alcoolique par ajout d'alcool pour conserver les sucres résiduels."},
    {"term": "No Low", "def": "Contraction de 'No alcohol' et 'Low ABV' désignant les boissons sans ou à faible degré d'alcool."},
    {"term": "Passer (Strain)", "def": "Filtrer le cocktail avec la passoire pour éliminer la glace et les résidus solides."},
    {"term": "Pourer", "def": "Bec verseur régulateur de débit inséré sur le goulot des bouteilles."},
    {"term": "Pré-batch", "def": "Préparation à l'avance d'un mélange de plusieurs ingrédients pour accélérer le service."},
    {"term": "Rainbow", "def": "Cocktail à étages colorés superposés selon la densité en sucre de chaque liquide."},
    {"term": "Reverse Dry Shake", "def": "Frapper d'abord avec glaçons, retirer la glace, puis frapper une seconde fois sans glace."},
    {"term": "Shaker Boston", "def": "Shaker à deux timbales (inox/verre ou 2 inox) s'emboîtant avec un axe décalé."},
    {"term": "Shaker Continental", "def": "Shaker parisien à deux pièces qui s'emboîtent parfaitement dans le même axe."},
    {"term": "Shaker 3 Pièces (Cobbler)", "def": "Shaker intégrant un filtre perforé et un bouchon doseur supérieur."},
    {"term": "Shooter", "def": "Boisson courte de 30 à 60 ml servie dans un verre shot à boire d'un trait."},
    {"term": "Sparkling", "def": "Cocktail long drink complété d'une boisson effervescente (Champagne, Prosecco, Crémant...)."},
    {"term": "Spiritueux", "def": "Boisson alcoolique titrant généralement plus de 15% vol obtenue par distillation."},
    {"term": "Squeeze Bottle", "def": "Flacon souple permettant de doser et verser facilement purées et sirops maison."},
    {"term": "Sirop de sucre", "def": "Sirop simple composé à parts égales de 1 volume d'eau et 1 volume de sucre semoule."},
    {"term": "Swizzle Stick", "def": "Bâtonnet traditionnel (bois lélé) à branches pour remuer les cocktails tropicaux sur glace pilée."},
    {"term": "Timbale (Tin)", "def": "Partie métallique en acier inoxydable d'un shaker."},
    {"term": "Trait (Dash)", "def": "Mesure représentant 3 à 5 gouttes d'un liquide aromatique concentré."},
    {"term": "Zeste", "def": "Partie extérieure de l'écorce d'un agrume contenant les huiles essentielles parfumées."}
]

data = {
    "modules": MODULES,
    "questions": QUESTIONS,
    "cocktails": COCKTAILS_DB,
    "lexique": LEXIQUE_DB
}

with open("app_data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Generated app_data.json successfully with {len(QUESTIONS)} questions, {len(MODULES)} modules, {len(COCKTAILS_DB)} cocktails, and {len(LEXIQUE_DB)} lexicon terms.")
