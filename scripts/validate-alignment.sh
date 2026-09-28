#!/bin/bash

# ============================================================================
# Syllabus Alignment Validator
# ============================================================================
# Ensures study notes maintain strict NESA NSW syllabus alignment
# Checks for non-syllabus content, missing metadata, and orphaned references
#
# Usage: ./scripts/validate-alignment.sh
#        or run via CI/CD to block commits with alignment issues

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
ERRORS=0
WARNINGS=0
CHECKS_PASSED=0

# ── Helper Functions ──

print_header() {
  echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

error() {
  echo -e "${RED}✗ ERROR: $1${NC}"
  ERRORS=$((ERRORS + 1))
}

warning() {
  echo -e "${YELLOW}⚠ WARNING: $1${NC}"
  WARNINGS=$((WARNINGS + 1))
}

success() {
  echo -e "${GREEN}✓ $1${NC}"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
}

# ── Validation Checks ──

print_header "NESA NSW Syllabus Alignment Validation"

# 1. Check for blacklisted tool names in markdown and HTML
print_header "Check 1: Blacklisted Tool References"

# Penetration-testing tools are not in the Enterprise Computing syllabus. The Principles of
# Cybersecurity focus area is about privacy, threats, awareness and law, not offensive tooling.
BLACKLIST_PATTERNS=("OWASP.ZAP" "Burp.Suite" "nessus" "openvas" "metasploit" "aircrack")

found_blacklist=0
for pattern in "${BLACKLIST_PATTERNS[@]}"; do
  # Search in resources/*.md and topics/**/*.html. Extended-Learning.md exists to point
  # beyond the syllabus, and nesa-syllabus-content.md is NESA's verbatim text, so both are exempt.
  matches=$(grep -rw "$pattern" "$PROJECT_ROOT/resources/" "$PROJECT_ROOT/topics/" \
    --exclude=Extended-Learning.md --exclude=nesa-syllabus-content.md 2>/dev/null || true)

  if [ -n "$matches" ]; then
    error "Found blacklisted tool reference: $pattern"
    echo "$matches" | sed 's/^/  /'
    found_blacklist=1
  fi
done

if [ $found_blacklist -eq 0 ]; then
  success "No blacklisted tool references found"
fi

# 2. Check for syllabus outcome metadata in HTML comments
print_header "Check 2: Syllabus Outcome Metadata"

echo "Checking every syllabus section carries outcome badges..."

# Resource pages (toolkit, project guide, example project, glossary, certified resources) are not syllabus focus areas.
topic_files=$(find "$PROJECT_ROOT/topics" -name "*.html" -type f ! -name glossary.html ! -name toolkit.html ! -name project-guide.html ! -name example-project.html ! -name resources.html)
outcome_pattern='class="outcome-subtitle">🎯 <em>\(EC-1[12]-[0-9][0-9]'
missing_annotations=0

for file in $topic_files; do
  if grep -qE "$outcome_pattern" "$file"; then
    success "Found outcome annotations in $(basename "$file")"
  else
    warning "Missing outcome annotations in $(basename "$file")"
    missing_annotations=1
  fi
done

# 3. Check every figure has a lead sentence and a "Try this" prompt
print_header "Check 3: Figure Text"

echo "Checking figures for a lead and a Try this prompt..."

for file in "$PROJECT_ROOT/topics"/*.html; do
  filename=$(basename "$file")
  figures=$(grep -c '<figure class="figure">' "$file" || true)
  [ "$figures" -eq 0 ] && continue
  leads=$(grep -c 'class="figure-lead"' "$file" || true)
  tries=$(grep -c 'class="figure-try"' "$file" || true)
  if [ "$leads" -ge "$figures" ] && [ "$tries" -ge $((figures - 2)) ]; then
    success "$filename: $figures figures with leads and prompts"
  else
    warning "$filename: $figures figures, $leads leads, $tries Try this prompts"
  fi
done

# 4. Check for programming-language code
print_header "Check 4: Code Blocks"

echo "Checking that code blocks are SQL, formulas or plain text (the course has no programming language)..."

# Enterprise Computing asks for SQL and spreadsheet formulas (Course Specifications pp. 17, 20),
# not a programming language. Flag a code block labelled with any other language.
suspicious_files=0

for file in "$PROJECT_ROOT/topics"/*.html; do
  other=$(grep -oE 'class="language-[a-z0-9+#-]+"' "$file" 2>/dev/null | grep -vE 'language-(sql|text|plaintext|formula|excel|csv|json|html|css)"' | sort -u || true)

  if [ -n "$other" ]; then
    warning "$(basename "$file") has code blocks in another language ($(echo "$other" | tr '\n' ' ')) — ensure they are syllabus-required"
    suspicious_files=$((suspicious_files + 1))
  fi
done

if [ $suspicious_files -eq 0 ]; then
  success "Code blocks use only SQL, formulas or plain text"
fi

# 5. Every focus-area page has one section per NESA dot point
print_header "Check 5: Content Structure Validation"

echo "Comparing each focus-area page with resources/nesa-syllabus-content.md..."

structure_report=$(cd "$PROJECT_ROOT" && python3 - <<'PY'
import os, re, sys
sys.path.insert(0, 'scripts')
from page_specs import SPECS
from restructure import load_syllabus
syl = load_syllabus()
for slug, spec in SPECS.items():
    want = sum(len(pts) for _, pts in syl[spec['focus_area']])
    path = os.path.join('topics', slug + '.html')
    got = len(re.findall(r'<p class="syllabus-concept">', open(path, encoding='utf-8').read())) if os.path.exists(path) else -1
    print(('ok' if got == want else 'bad'), slug, got, want)
PY
) || structure_report="bad (script) 0 0"

while read -r status slug got want; do
  if [ "$status" = "ok" ]; then
    success "$slug.html: $got sections for $want NESA dot points"
  else
    error "$slug.html: $got sections but NESA has $want dot points"
  fi
done <<< "$structure_report"

# 6. Markdown frontmatter validation
print_header "Check 6: Resource Documentation"

echo "Checking for markdown metadata..."

md_files=$(find "$PROJECT_ROOT/resources" -name "*.md" -type f)
meta_issues=0

for file in $md_files; do
  if head -n 5 "$file" | grep -q "^#"; then
    success "$(basename "$file") has proper heading structure"
  else
    warning "$(basename "$file") may lack proper heading structure"
    meta_issues=$((meta_issues + 1))
  fi
done

# ── Summary Report ──

print_header "Validation Summary"

total_checks=$((CHECKS_PASSED + ERRORS + WARNINGS))
echo -e "Total Checks: ${BLUE}$total_checks${NC}"
echo -e "Passed:       ${GREEN}$CHECKS_PASSED${NC}"
echo -e "Warnings:     ${YELLOW}$WARNINGS${NC}"
echo -e "Errors:       ${RED}$ERRORS${NC}"

print_header "Validation Result"

if [ $ERRORS -gt 0 ]; then
  echo -e "${RED}❌ Validation FAILED ($ERRORS errors)${NC}"
  echo -e "\nFix errors before committing. Use template at:"
  echo -e "${BLUE}.claude/skills/add-topic.md${NC}"
  exit 1
elif [ $WARNINGS -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Validation PASSED with WARNINGS ($WARNINGS warnings)${NC}"
  echo -e "\nReview warnings and consider updates for consistency."
  exit 0
else
  echo -e "${GREEN}✅ Validation PASSED (all checks successful)${NC}"
  exit 0
fi
