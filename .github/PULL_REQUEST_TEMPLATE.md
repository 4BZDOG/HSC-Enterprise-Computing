## Summary

<!-- What does this pull request do? Which page, script or document does it touch? -->

## Motivation and context

<!-- Why is the change needed? Link related issues: fixes #123 -->

## Changes made

<!--
- Added...
- Updated...
- Fixed...
- Removed...
-->

## Type of change

- [ ] New or expanded content (a topic page, quiz, glossary terms)
- [ ] Correction to existing content
- [ ] Diagram or figure
- [ ] Style, layout or accessibility
- [ ] Scripts, checks or workflows
- [ ] Documentation

## Syllabus and source checks (content changes)

- [ ] Dot points, "Including" lists and part names are still NESA's wording, verbatim and in order (they come from `resources/nesa-syllabus-content.md` and are checked by `scripts/check-site.py`)
- [ ] Outcome codes on each section belong to that focus area
- [ ] Diagram notation follows the NESA Enterprise Computing Course Specifications (`resources/ec-course-specifications.md`)
- [ ] UK / Australian English; NESA command verbs used correctly
- [ ] No copied NESA pages, course-specification PDF or spec-page images added (link to NESA's official copy instead)
- [ ] External links checked and only to reputable sources

## Checks run

```bash
python3 scripts/site-chrome.py
python3 scripts/build-glossary.py
python3 scripts/build-mapping.py
python3 scripts/check-site.py
bash scripts/validate-alignment.sh
```

- [ ] All of the above pass (add `--strict` to `check-site.py` if the page is finished)
- [ ] Glossary terms added through `scripts/glossary_new_terms.py` (not by hand-editing `js/glossary-data.js`)
- [ ] Navigation and footer changed only through `scripts/site-chrome.py`

## Testing

- [ ] Desktop view (light and dark)
- [ ] Phone width (about 390 px), no horizontal scrolling
- [ ] Figures readable, with alt text; animated diagrams respect reduced motion
- [ ] No console errors
- [ ] Links work

## Screenshots (if visual)

<!-- Before and after, in light and dark mode -->

## Notes for reviewers

<!-- Anything the reviewer should look at first, or that you were unsure about -->
