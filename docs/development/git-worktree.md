# Git Branch, Worktree와 Orca

## 가장 짧은 설명

- **Git branch:** 특정 commit을 가리키며 앞으로의 변경 이력이 어느 작업에 속하는지 나타내는 이름이다.
- **Git worktree:** 한 Git repository의 branch를 실제 파일로 펼쳐 놓은 작업 폴더다.
- **Orca:** Git worktree 자체를 대체하는 도구가 아니라 worktree, 터미널과 AI 세션을 함께 만들고 보여 주는 개발 환경이다.

## Branch와 Worktree의 차이

Branch만 만들면 새 작업 이력의 이름은 생기지만 파일을 볼 별도 폴더가 자동으로 필요한 것은 아니다. Worktree를 만들면 같은 repository를 공유하는 별도 폴더에서 다른 branch를 동시에 열 수 있다.

## Branch 이름 규칙

이 프로젝트의 branch 이름은 `chore/`나 `feat/` 같은 작업 유형 접두사보다 작업 주제를 우선한다. agent 또는 사용자 식별자를 포함할 때에는 `uiuuymin/<작업 주제>` 형식을 사용한다.

예시는 다음과 같다.

- `uiuuymin/bootstrap`
- `uiuuymin/ui-foundation`
- `uiuuymin/api-bootstrap`
- `uiuuymin/product-read-api`

Worktree의 표시 이름도 branch의 작업 주제와 맞추며, 기존 worktree의 로컬 폴더 경로는 branch 이름 변경만으로 자동 변경하지 않는다.

예를 들어 `main`에서 `test-orca`를 만들면 생성 직후 두 branch는 같은 commit을 가리킬 수 있다.

```text
생성 직후

main ───────────── A
                    ↑
             test-orca
```

`test-orca` worktree에서 변경을 commit하면 branch가 갈라진다.

```text
main ───────────── A
                    \
test-orca ─────────── B
```

두 폴더의 파일은 서로 독립적으로 보이지만 Git history, object database와 remote 설정은 같은 repository를 공유한다. 독립적인 `git clone`을 하나 더 만드는 것과 다르다.

## 왜 기능마다 Worktree를 사용하는가?

- `main` 폴더를 안정된 상태로 남겨 둘 수 있다.
- 여러 작업의 미완성 파일이 한 working directory에 섞이지 않는다.
- 각 폴더의 terminal, Codex 대화와 diff가 하나의 목표에 대응한다.
- 작업을 멈췄다가 다시 열어도 해당 branch의 파일 상태가 유지된다.

## Orca의 역할

Orca는 repository와 Git worktree를 시각적으로 관리하고, 각 worktree 안에서 Codex나 shell을 실행하게 돕는다.

```text
Orca
  ↓ 관리
Git worktree와 branch
  ↓ 작업 위치 제공
Codex / terminal
  ↓ 읽기·수정
Repository 파일
```

Orca 화면에서 worktree를 만들더라도 실제 version history와 branch 규칙은 Git이 담당한다. 따라서 Orca 사용 중에도 현재 branch, `git status`, diff와 commit 내용을 직접 확인해야 한다.

## 작업 원칙

1. 새 기능 또는 의미 있는 실험마다 목적이 드러나는 branch/worktree 이름을 정한다.
2. Codex를 실행하기 전에 worktree가 올바른 repository와 branch인지 확인한다.
3. 하나의 worktree에서는 하나의 task만 진행한다.
4. 구현 후 테스트와 diff를 검토하고 관련 Wiki 문서를 갱신한다.
5. 사용자 승인 후 commit하고, 검토가 끝난 뒤 `main`에 병합한다.
6. worktree를 제거하기 전에 미커밋 변경과 필요한 branch가 남아 있는지 확인한다.

하나의 branch를 여러 worktree에 동시에 checkout하는 데는 Git의 제한이 있다. branch와 worktree 삭제도 서로 같은 작업이 아니므로 정리할 때는 둘의 상태를 각각 확인한다.
