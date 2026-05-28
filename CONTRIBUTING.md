# 🤝 Contributing to 9haejo

> 구해조 프로젝트에 기여해 주셔서 감사합니다!  
> 이 문서는 프로젝트에 기여하는 방법을 안내합니다.

---

## 📋 목차

- [행동 강령](#행동-강령)
- [시작하기 전에](#시작하기-전에)
- [개발 환경 설정](#개발-환경-설정)
- [기여 프로세스](#기여-프로세스)
- [브랜치 전략](#브랜치-전략)
- [커밋 메시지 규칙](#커밋-메시지-규칙)
- [Pull Request 규칙](#pull-request-규칙)
- [이슈 작성 가이드](#이슈-작성-가이드)
- [AI 사용 정책](#ai-사용-정책)
- [코드 스타일](#코드-스타일)

---

## 행동 강령

- 모든 팀원은 서로를 존중하며 협력합니다.
- 건설적인 피드백을 지향하고, 코드가 아닌 **아이디어**를 비평합니다.
- 불명확한 부분은 추측하지 않고 **이슈 또는 PR 댓글**을 통해 먼저 질문합니다.

---

## 시작하기 전에

기여를 시작하기 전, 아래를 확인해 주세요.

- [ ] 기존 [이슈 목록](https://github.com/norandal/9haejo/issues)에서 유사한 이슈가 없는지 확인
- [ ] 새로운 기능이라면 이슈를 먼저 열고 팀과 논의 후 작업 시작
- [ ] `main` 브랜치를 직접 수정하지 않기

---

## 개발 환경 설정

### 1. 저장소 클론

```bash
git clone https://github.com/norandal/9haejo.git
cd 9haejo
```

### 2. 가상환경 생성 및 패키지 설치

```bash
# conda 환경 (권장)
conda create -n 9haejo python=3.11
conda activate 9haejo
pip install -r requirements.txt

# 또는 venv
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. 환경 변수 설정

```bash
cp .env.example .env
# .env 파일을 열어 필요한 API 키 입력
```

> ⚠️ `.env` 파일은 절대 커밋하지 마세요. `.gitignore`에 포함되어 있습니다.

---

## 기여 프로세스

```
1. 이슈 생성 또는 기존 이슈 확인
        ↓
2. feature 브랜치 생성
        ↓
3. 코드 작성 및 로컬 테스트
        ↓
4. 커밋 (메시지 규칙 준수)
        ↓
5. Pull Request 생성
        ↓
6. 코드 리뷰 (최소 1명 승인)
        ↓
7. develop 브랜치에 병합 (Maintainer)
```

---

## 브랜치 전략

| 브랜치 | 용도 | 직접 push |
|--------|------|-----------|
| `main` | 배포용 안정 버전 | ❌ 금지 |
| `develop` | 개발 통합 브랜치 | ❌ 금지 |
| `feature/...` | 기능 개발 | ✅ 가능 |
| `fix/...` | 버그 수정 | ✅ 가능 |
| `docs/...` | 문서 작업 | ✅ 가능 |

### 브랜치 생성 예시

```bash
# 기능 개발
git checkout -b feature/ai-market-summary

# 버그 수정
git checkout -b fix/sns-publish-error

# 문서 작업
git checkout -b docs/update-readme
```

---

## 커밋 메시지 규칙

### 형식

```
<type>: <subject>

[body - 선택사항]
[footer - 선택사항, 이슈 번호 등]
```

### Type 목록

| Type | 설명 |
|------|------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 수정 (README, 주석 등) |
| `refactor` | 기능 변경 없는 코드 리팩토링 |
| `test` | 테스트 코드 추가/수정 |
| `chore` | 빌드, 패키지, 설정 변경 |
| `ai` | AI 프롬프트 또는 모델 관련 변경 |

### 예시

```bash
feat: 시장 요약 AI 프롬프트 초안 추가

- Claude API를 활용한 일일 시장 요약 기능 구현
- 코스피/나스닥 지수 변동 요약 포함

Closes #12
```

---

## Pull Request 규칙

### PR 제목 형식

```
[type] 작업 내용 요약
```

예시:
```
[feat] 코스피 일일 요약 AI 파이프라인 구현
[fix] SNS 게시 중복 발행 버그 수정
[docs] CONTRIBUTING.md 초안 작성
```

### PR 체크리스트

PR을 생성할 때 아래 항목을 확인해 주세요.

```markdown
## 변경 사항
- [ ] 어떤 이슈를 해결하나요? (Closes #이슈번호)
- [ ] 변경 내용을 간략히 설명해 주세요.

## 테스트
- [ ] 로컬에서 테스트 완료
- [ ] 기존 기능이 정상 동작함을 확인

## AI 사용 여부
- [ ] AI 도구를 사용했다면 `ai-log.md`에 기록 완료
- [ ] AI 생성 결과물의 사실 관계 검토 완료
```

### 병합 규칙

- 최소 **1명의 Reviewer 승인** 필수
- `main` 병합은 **Maintainer(강현경)** 만 수행
- Merge 방식: **Squash and Merge** (커밋 히스토리 정리)

---

## 이슈 작성 가이드

### 버그 리포트

```markdown
**버그 설명**
어떤 문제가 발생했는지 간략히 설명해 주세요.

**재현 방법**
1. ...
2. ...

**기대 동작**
원래 어떻게 동작해야 하나요?

**실제 동작**
실제로 어떻게 동작했나요?

**환경**
- OS: (예: macOS 14, Windows 11)
- Python 버전: (예: 3.11.4)
```

### 기능 제안

```markdown
**기능 설명**
어떤 기능을 제안하시나요?

**왜 필요한가요?**
이 기능이 왜 유용한지 설명해 주세요.

**구현 아이디어 (선택)**
구현 방법에 대한 아이디어가 있다면 적어 주세요.
```

---

## AI 사용 정책

본 프로젝트는 AI 도구 사용을 허용하되, **투명한 기록과 인간 검증**을 원칙으로 합니다.

### 기록 의무

AI 도구(ChatGPT, Claude, Copilot 등)를 사용한 경우, **반드시** `ai-log.md`에 기록해야 합니다.

```markdown
## YYYY-MM-DD

| 항목 | 내용 |
|------|------|
| 사용 도구 | Claude 3.5 Sonnet |
| 작업 내용 | 시장 요약 프롬프트 초안 작성 |
| 프롬프트 요약 | "코스피 일일 등락률을 SNS용 2줄로 요약해줘" |
| 결과 활용 여부 | 일부 수정 후 반영 |
| 인간 검증 | ✅ 완료 |
```

### 금지 사항

- AI 생성 결과물을 **검토 없이** 그대로 배포하는 행위
- 금융 정보의 사실 관계를 **확인하지 않고** 게시하는 행위
- API 키, 토큰 등 민감 정보를 AI 도구에 입력하는 행위

---

## 코드 스타일

### Python

- **PEP 8** 준수
- 함수·변수명: `snake_case`
- 클래스명: `PascalCase`
- 최대 줄 길이: **100자**
- 포매터: `black` 권장

```bash
pip install black
black .
```

### 주석 및 Docstring

```python
def summarize_market(ticker: str, date: str) -> str:
    """
    특정 종목의 일일 시장 상황을 AI로 요약합니다.

    Args:
        ticker (str): 종목 코드 (예: "005930" for 삼성전자)
        date (str): 조회 날짜 (형식: "YYYY-MM-DD")

    Returns:
        str: AI가 생성한 시장 요약 텍스트
    """
    ...
```

---

## 📬 문의

질문이나 제안이 있다면 [Issues](https://github.com/norandal/9haejo/issues)를 통해 알려주세요.

---

*본 문서는 Docs 담당자(김하율)가 관리하며, 프로젝트 진행에 따라 업데이트됩니다.*
