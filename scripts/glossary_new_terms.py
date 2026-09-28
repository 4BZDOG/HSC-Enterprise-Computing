# Syllabus keywords added to the glossary: (id, name, topics, definition, example)
#
#   ('term-ux', 'User Experience (UX)', ['im', 'dv'],
#    'How a person feels and behaves when they use a product or service.',
#    'A checkout that needs three taps instead of ten.'),
#
# The id is 'term-' plus a kebab-case name. Definitions and examples may contain simple HTML
# such as <code>...</code>. Then run:
#   python3 scripts/add-glossary-terms.py && python3 scripts/build-glossary.py && python3 scripts/site-chrome.py
#
# Topic keys (each becomes a tag on the term card and a filter on the glossary page):
#   im, net, cyber          Year 11 focus areas
#   ds, dv, is, ep          Year 12 focus areas
#   toolkit, project        Resources pages
TERMS = []

TOPIC_CHIPS = {
    'im': ('chip-y11', 'Interactive Media and the User Experience'),
    'net': ('chip-y11', 'Networking Systems and Social Computing'),
    'cyber': ('chip-y11', 'Principles of Cybersecurity'),
    'ds': ('chip-y12', 'Data Science'),
    'dv': ('chip-y12', 'Data Visualisation'),
    'is': ('chip-y12', 'Intelligent Systems'),
    'ep': ('chip-y12', 'Enterprise Project'),
    'toolkit': ('chip-core', 'Course Toolkit'),
    'project': ('chip-core', 'Project Management Guide'),
}
