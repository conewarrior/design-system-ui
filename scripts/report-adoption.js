#!/usr/bin/env node
/**
 * Adoption Reporter (opt-in)
 *
 * 패키지 설치 시 자동으로 실행되어 채택 현황을 보고합니다.
 *
 * Opt-in 방법:
 * 1. 환경변수: DESIGN_SYSTEM_REPORT=true
 * 2. 프로젝트 루트에 .designrc 파일: { "report": true }
 * 3. package.json에 "designSystem": { "report": true }
 *
 * 보고되는 정보:
 * - 프로젝트 이름
 * - 저장소 URL (있는 경우)
 * - 설치된 버전
 * - 타임스탬프
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DESIGN_SYSTEM_REPO = 'conewarrior/design-system';
const PACKAGE_NAME = '@gpters-internal/ui';

// opt-in 확인
function isOptedIn() {
  // 1. 환경변수
  if (process.env.DESIGN_SYSTEM_REPORT === 'true') {
    return true;
  }

  // CI 환경에서는 기본 비활성화
  if (process.env.CI) {
    return false;
  }

  try {
    // 프로젝트 루트 찾기 (node_modules 상위)
    const projectRoot = findProjectRoot();
    if (!projectRoot) return false;

    // 2. .designrc 파일
    const rcPath = path.join(projectRoot, '.designrc');
    if (fs.existsSync(rcPath)) {
      const rc = JSON.parse(fs.readFileSync(rcPath, 'utf-8'));
      if (rc.report === true) return true;
    }

    // 3. package.json의 designSystem 필드
    const pkgPath = path.join(projectRoot, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      if (pkg.designSystem?.report === true) return true;
    }
  } catch {
    // 오류 시 비활성화
  }

  return false;
}

// 프로젝트 루트 찾기
function findProjectRoot() {
  let dir = process.cwd();

  // node_modules 내부에서 실행되는 경우
  const nodeModulesIndex = dir.indexOf('node_modules');
  if (nodeModulesIndex !== -1) {
    return dir.substring(0, nodeModulesIndex - 1);
  }

  // 상위로 올라가며 package.json 찾기
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }

  return null;
}

// 프로젝트 정보 수집
function getProjectInfo() {
  const projectRoot = findProjectRoot();
  if (!projectRoot) return null;

  try {
    const pkgPath = path.join(projectRoot, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    // 설치된 버전 확인
    let installedVersion = null;
    try {
      const lockPath = path.join(projectRoot, 'package-lock.json');
      if (fs.existsSync(lockPath)) {
        const lock = JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
        installedVersion = lock.packages?.[`node_modules/${PACKAGE_NAME}`]?.version
          || lock.dependencies?.[PACKAGE_NAME]?.version;
      }
    } catch {}

    // 버전을 못 찾으면 현재 패키지에서
    if (!installedVersion) {
      try {
        const ourPkgPath = path.join(__dirname, '..', 'package.json');
        const ourPkg = JSON.parse(fs.readFileSync(ourPkgPath, 'utf-8'));
        installedVersion = ourPkg.version;
      } catch {}
    }

    return {
      name: pkg.name || 'unknown',
      repository: typeof pkg.repository === 'string'
        ? pkg.repository
        : pkg.repository?.url?.replace(/^git\+/, '').replace(/\.git$/, '') || null,
      version: installedVersion,
      description: pkg.description || '',
    };
  } catch {
    return null;
  }
}

// gh CLI로 보고
async function reportWithGh(info) {
  try {
    // gh CLI 확인
    execSync('gh --version', { stdio: 'ignore' });

    // 기존 issue 검색 (adoption tracking)
    const searchResult = execSync(
      `gh issue list --repo ${DESIGN_SYSTEM_REPO} --label "adoption" --state open --json number,title --limit 1`,
      { encoding: 'utf-8' }
    );

    const issues = JSON.parse(searchResult);

    const reportBody = [
      `## Adoption Report`,
      `- **Project**: ${info.name}`,
      `- **Repository**: ${info.repository || 'N/A'}`,
      `- **Version**: ${info.version || 'unknown'}`,
      `- **Reported**: ${new Date().toISOString()}`,
    ].join('\n');

    if (issues.length > 0) {
      // 기존 issue에 코멘트
      execSync(
        `gh issue comment ${issues[0].number} --repo ${DESIGN_SYSTEM_REPO} --body "${reportBody.replace(/"/g, '\\"')}"`,
        { stdio: 'ignore' }
      );
    } else {
      // 새 issue 생성
      execSync(
        `gh issue create --repo ${DESIGN_SYSTEM_REPO} --title "Adoption Tracking" --label "adoption" --body "This issue tracks package adoption.\n\n${reportBody}"`,
        { stdio: 'ignore' }
      );
    }

    console.log(`📊 ${PACKAGE_NAME}: Adoption reported to ${DESIGN_SYSTEM_REPO}`);
    return true;
  } catch (error) {
    // gh CLI 없거나 권한 없으면 조용히 실패
    return false;
  }
}

// GitHub API로 보고 (gh CLI 없는 경우)
async function reportWithApi(info) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return false;

  try {
    const body = JSON.stringify({
      event_type: 'adoption-report',
      client_payload: {
        project: info.name,
        repository: info.repository,
        version: info.version,
        timestamp: new Date().toISOString(),
      }
    });

    const response = await fetch(
      `https://api.github.com/repos/${DESIGN_SYSTEM_REPO}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body,
      }
    );

    if (response.ok) {
      console.log(`📊 ${PACKAGE_NAME}: Adoption reported`);
      return true;
    }
  } catch {}

  return false;
}

// 메인
async function main() {
  // opt-in 확인
  if (!isOptedIn()) {
    return;
  }

  // 프로젝트 정보 수집
  const info = getProjectInfo();
  if (!info) {
    return;
  }

  // 자기 자신(design-system)은 제외
  if (info.name === PACKAGE_NAME || info.repository?.includes(DESIGN_SYSTEM_REPO)) {
    return;
  }

  // 보고 시도 (gh CLI 우선, 없으면 API)
  const reported = await reportWithGh(info) || await reportWithApi(info);

  if (!reported) {
    // 보고 실패해도 설치는 계속 진행
  }
}

main().catch(() => {
  // 오류가 있어도 설치 중단하지 않음
});
