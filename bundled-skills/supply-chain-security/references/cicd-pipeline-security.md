# CI/CD 管道安全审计

## 管道攻击面

```text
威胁模型（STRIDE）:
□ 欺骗: 伪造构建/签名/来源
□ 篡改: 修改源代码/构建产物/依赖
□ 否认: 无审计日志的恶意操作
□ 信息泄露: 管道日志/构建产物泄漏密钥
□ 拒绝服务: 耗尽 CI 资源/破坏构建
□ 权限提升: Runner 逃逸/密钥窃取
```

## 审计清单

### 1. Pipeline as Code 配置

```yaml
# GitHub Actions 审计要点
# ❌ 危险模式
on:
  pull_request_target:  # 可访问 secrets 的 PR 触发
    types: [opened]

# ❌ 脚本注入
- run: echo "${{ github.event.issue.title }}"  # 用户输入 → shell

# ❌ 不受限的 token 权限
permissions: write-all

# ✅ 安全模式
on:
  pull_request:  # 无 secrets 访问
    types: [opened]

# ✅ 固定到 SHA
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683

# ✅ 最小权限
permissions:
  contents: read
```

### 2. 密钥管理

```bash
# 扫描历史提交中的密钥
gitleaks detect --source . --verbose
trufflehog git file://. --only-verified

# 检查 Actions Secrets 使用
gh secret list
# 确认: 无硬编码密钥、定期轮换、最小权限

# 运行时密钥注入
# ✅ 使用 OIDC 替代长期密钥
# ✅ Secrets 仅在需要时暴露到特定步骤
```

### 3. 构建完整性

```bash
# 构建溯源
# 生成不可篡改的构建记录（SLSA L2+）
slsa-provenance generate --source . --output provenance.json

# 产物签名
cosign sign-blob --key cosign.key artifact.tar.gz

# 验证
cosign verify-blob --key cosign.pub --signature artifact.tar.gz.sig artifact.tar.gz
```

### 4. Runner 安全

```text
□ 是否使用 GitHub-hosted runner？（推荐，每次全新环境）
□ Self-hosted runner: 是否在隔离的 VM/容器中运行？
□ 是否运行过 fork PR？（self-hosted runner 风险极高）
□ Runner 是否有网络出站限制？
□ 构建缓存是否可能跨构建泄漏？
```

### 5. 依赖拉取安全

```text
□ npm: package-lock.json 是否提交？ 禁止 --force / --legacy-peer-deps
□ pip: requirements.txt 是否冻结版本？ 禁止 pip install <未验证来源>
□ Docker: FROM 是否固定 digest？ 禁止 latest tag
□ Go: go.sum 是否提交？
□ 私有包: 注册表认证是否用短期 token？
```

## 自动化检查 Pipeline

通过项目已有且锁定版本的工具运行本地 SBOM、SCA、镜像和密钥扫描。外部 Actions 必须绑定经核验的完整提交 SHA；扫描失败保持非零退出，不将失败当作成功。不要安装 @latest 工具、执行未固定 Action 或默认上传结果。

上传 SBOM 到 Dependency-Track 或其他服务前，核对接收方、项目身份、私有依赖泄露风险及许可；获得授权后才能单独配置上传步骤。使用环境变量传递秘密，不把 Actions 表达式直接插入 shell 代码；通知和定时监控需明确授权。当前文档不提供未经验证的第三方自动执行流水线。

Source: SLSA Framework, OWASP CI/CD Top 10, GitHub Security Lab
