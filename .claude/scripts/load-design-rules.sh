#!/bin/bash
# design-rules 조건부 로드 - UI 관련 키워드가 있을 때만
# UserPromptSubmit hook에서 stdin으로 {"prompt": "..."} JSON을 받음

PROMPT=$(jq -r '.prompt // empty' 2>/dev/null)
RULES_PATH="node_modules/@gpters-internal/ui/.claude/skills/design-rules.md"

if echo "$PROMPT" | grep -qiE '(컴포넌트|component|ui|디자인|design|페이지|page|화면|screen|레이아웃|layout|스타일|style|버튼|button|카드|card|모달|modal|폼|form|테이블|table|사이드바|sidebar|네비|nav|헤더|header)'; then
  if [ -f "$RULES_PATH" ]; then
    cat "$RULES_PATH"
  fi
fi
