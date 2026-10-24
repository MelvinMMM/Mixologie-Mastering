# -*- coding: utf-8 -*-
import json

with open('data.js', 'r', encoding='utf-8') as f:
    text = f.read()

json_str = text.replace('// Référentiel Officiel des Cocktails Classiques de Référence (Édition 2025/2026)\nconst APP_DATA = ', '').rstrip(';\n ')
app_data = json.loads(json_str)

new_questions = [
    {
        'id': 'm1_q_sour',
        'moduleId': 1,
        'badge': 'Équilibre - Sour',
        'question': 'Dans la règle d’équilibre des « 3 S », par quoi est apporté l’élément « SOUR » (l’acidité / le lien) ?',
        'options': [
            'Par un agrume (citron jaune, vert), du verjus ou une solution acide',
            'Par du sucre de canne liquide et du miel',
            'Par une crème de cacao et du lait concentré',
            'Par du gin et du tonic'
        ],
        'correctAnswer': 0,
        'explanation': 'Le SOUR représente l’acidité et le lien du cocktail. Il peut être apporté par un agrume, du verjus ou encore une solution acide.'
    },
    {
        'id': 'm1_q_sweet',
        'moduleId': 1,
        'badge': 'Équilibre - Sweet',
        'question': 'Dans la règle d’équilibre des « 3 S », par quoi peut être apporté l’élément « SWEET » (la douceur) ?',
        'options': [
            'Par une liqueur, une crème, un fruit, un sirop ou du sucre en poudre extra fin',
            'Uniquement par des glaçons d’eau pure',
            'Par du jus de citron jaune et du sel',
            'Par de l’eau-de-vie pure à 50% vol'
        ],
        'correctAnswer': 0,
        'explanation': 'Le SWEET apporte le sucré et la douceur du cocktail. Il peut être apporté par une liqueur, une crème, un fruit, un sirop ou tout simplement du sucre en poudre extra fin.'
    },
    {
        'id': 'm1_q_strong',
        'moduleId': 1,
        'badge': 'Équilibre - Strong',
        'question': 'Dans la règle d’équilibre des « 3 S », quel est le rôle de l’élément « STRONG » et par quoi est-il apporté ?',
        'options': [
            'Il représente la puissance et le corps du cocktail, apporté principalement par l’eau-de-vie (ou le spiritueux)',
            'Il représente la quantité de glaçons dans le verre',
            'Il représente l’amertume extrême apportée par 10 traits de bitter',
            'Il représente le volume total de soda gazeux'
        ],
        'correctAnswer': 0,
        'explanation': 'Le STRONG est la puissance et le corps du cocktail. L’eau-de-vie (ou le spiritueux) est le principal ingrédient apportant cette force et cette structure aromatique.'
    },
    {
        'id': 'm1_q_shaker',
        'moduleId': 1,
        'badge': 'Technique Shaker',
        'question': 'Selon le guide des bonnes pratiques, dans quel cas doit-on privilégier l’utilisation du SHAKER ?',
        'options': [
            'Pour mélanger, émulsionner et rafraîchir en limitant la fonte de la glace (ingrédients denses : jus, crème, œuf, etc.)',
            'Uniquement pour les alcools purs sans aucun jus ni fruit',
            'Pour faire chauffer les ingrédients avant de servir',
            'Uniquement pour les boissons gazeuses et le champagne'
        ],
        'correctAnswer': 0,
        'explanation': 'Selon la Partie 1 du référentiel : le Shaker est utilisé pour mélanger, émulsionner et rafraîchir, en limitant la fonte de la glace (pour les jus, crème, œuf, etc.).'
    },
    {
        'id': 'm1_q_verre_melange',
        'moduleId': 1,
        'badge': 'Verre à mélange',
        'question': 'Selon le référentiel, quel est l’objectif principal du VERRE À MÉLANGE et quels ingrédients y sont proscrits ?',
        'options': [
            'Mélanger et rafraîchir en apportant la dilution nécessaire aux produits alcooliques (ne pas utiliser pour les jus, sodas, œufs...)',
            'Écraser des fruits frais avec de la glace pilée',
            'Faire mousser les blancs d’œufs sans glaçons',
            'Chauffer les cocktails d’hiver'
        ],
        'correctAnswer': 0,
        'explanation': 'Le Verre à mélange est utilisé pour mélanger et rafraîchir, en apportant une dilution nécessaire à l’homogénéisation des produits notamment alcooliques. Il ne doit pas être utilisé pour les jus, sodas, crèmes ou émulsifiants.'
    },
    {
        'id': 'm1_q_direct_verre',
        'moduleId': 1,
        'badge': 'Direct au verre',
        'question': 'Dans quel cas le référentiel préconise-t-il la réalisation DIRECTE AU VERRE ?',
        'options': [
            'Lorsque les ingrédients de la recette se mélangent facilement sans nécessiter d’émulsion',
            'Uniquement lorsqu’on n’a pas le temps de laver son shaker',
            'Pour tous les cocktails à base d’œufs et de purées très denses',
            'Exclusivement pour les cocktails flambés'
        ],
        'correctAnswer': 0,
        'explanation': 'Selon la Partie 1 du référentiel : la technique Direct au verre est préconisée « lorsque les ingrédients de la recette se mélangent facilement ».'
    }
]

# Keep non-redundant existing questions
to_remove = ['m1_q10', 'm1_q8', 'm1_q_shaker', 'm1_q_verre_melange', 'm1_q_direct_verre', 'm1_q_sweet', 'm1_q_strong', 'm1_q_sour']
clean_m1 = [q for q in app_data['questions'] if q['moduleId'] == 1 and q['id'] not in to_remove]
clean_other = [q for q in app_data['questions'] if q['moduleId'] != 1]

app_data['questions'] = clean_m1 + new_questions + clean_other

with open('data.js', 'w', encoding='utf-8') as f:
    f.write('// Référentiel Officiel des Cocktails Classiques de Référence (Édition 2025/2026)\n')
    f.write('const APP_DATA = ' + json.dumps(app_data, ensure_ascii=False, indent=2) + ';\n')

print("Updated data.js: Module 1 questions =", len(clean_m1) + len(new_questions), ", Total questions =", len(app_data['questions']))
