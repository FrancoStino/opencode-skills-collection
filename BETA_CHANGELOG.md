# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0-beta.1] - 2026-04-08
### :sparkles: New Features
- [`971bc4b`](https://github.com/FrancoStino/opencode-skills-collection/commit/971bc4b6618568ed61c6dbb69a11e746b2d019c4) - integrate SkillPointer architecture in TypeScript *(commit by [@FrancoStino](https://github.com/FrancoStino))*
- [`166cd92`](https://github.com/FrancoStino/opencode-skills-collection/commit/166cd926ff7290aa5a3c777fd96c67de0d661ce0) - download skills_index.json from upstream during sync *(commit by [@FrancoStino](https://github.com/FrancoStino))*
- [`78619f3`](https://github.com/FrancoStino/opencode-skills-collection/commit/78619f33fd1020109c38160b94696c4396a3127d) - add skills index configuration file *(commit by [@FrancoStino](https://github.com/FrancoStino))*
- [`4438109`](https://github.com/FrancoStino/opencode-skills-collection/commit/44381090ced588259361155a6f3db667dd0a6e6a) - integrate uncategorized category constant and update related files *(commit by [@FrancoStino](https://github.com/FrancoStino))*
- [`7ed1f7d`](https://github.com/FrancoStino/opencode-skills-collection/commit/7ed1f7db5a9b4b5f9e8849b00c913d322d59e5b1) - update skills index path and sync process *(commit by [@FrancoStino](https://github.com/FrancoStino))*
- [`dd3c875`](https://github.com/FrancoStino/opencode-skills-collection/commit/dd3c875e7cad6515601c4bdc35ca37f6e09d1f6a) - add GitHub Actions workflow for beta releases *(commit by [@FrancoStino](https://github.com/FrancoStino))*
- [`84920ee`](https://github.com/FrancoStino/opencode-skills-collection/commit/84920ee02eb2b953eab8513214d70fb194686a24) - bump version to 2.0.0 and update dependencies *(commit by [@FrancoStino](https://github.com/FrancoStino))*
- [`d8f8747`](https://github.com/FrancoStino/opencode-skills-collection/commit/d8f87479b4b049962407033143d336718645780b) - update dependencies to version 1.4.0 *(commit by [@FrancoStino](https://github.com/FrancoStino))*
- [`80e3b94`](https://github.com/FrancoStino/opencode-skills-collection/commit/80e3b940c753d35409707df545960264830085d5) - **ci**: enhance beta release workflow with changelog generation *(commit by [@FrancoStino](https://github.com/FrancoStino))*

### :bug: Bug Fixes
- [`effbe74`](https://github.com/FrancoStino/opencode-skills-collection/commit/effbe74287cc3196fec88fb0dc9ef645bffe854c) - rename vault dir to skill-libraries and move it under ~/.config/opencode/ *(commit by [@FrancoStino](https://github.com/FrancoStino))*
- [`069798b`](https://github.com/FrancoStino/opencode-skills-collection/commit/069798bd0397e4033527aed9bc23022c1b98cbe5) - **utils**: fix broken import heuristics→constants, remove dead code *(commit by [@FrancoStino](https://github.com/FrancoStino))*
- [`fcfa139`](https://github.com/FrancoStino/opencode-skills-collection/commit/fcfa13976b5d9833f30888b8de3aada352265bc0) - tsconfig moduleResolution bundler→node16, CI guards *(commit by [@FrancoStino](https://github.com/FrancoStino))*
- [`7627d92`](https://github.com/FrancoStino/opencode-skills-collection/commit/7627d928a8eee6e6067b536eade3e9add63cc4dc) - generate skills_index.json on-the-fly from SKILL.md frontmatter when missing *(commit by [@FrancoStino](https://github.com/FrancoStino))*

### :recycle: Refactors
- [`202fb55`](https://github.com/FrancoStino/opencode-skills-collection/commit/202fb55cbc24431d7a1224a51bc470af24a3c6f4) - remove redundant PR_TERMS check in getCategoryForSkill *(commit by [@FrancoStino](https://github.com/FrancoStino))*
- [`6b184d9`](https://github.com/FrancoStino/opencode-skills-collection/commit/6b184d96e7e54f10866e73d544b0d54c007406ed) - copy bundled skills directly into vault, never touch skills/ *(commit by [@FrancoStino](https://github.com/FrancoStino))*
- [`038ddac`](https://github.com/FrancoStino/opencode-skills-collection/commit/038ddacd98ed188900c9202cbdeae407b2a835b4) - replace categorizer.ts with skills_index.json lookup *(commit by [@FrancoStino](https://github.com/FrancoStino))*
- [`7be127d`](https://github.com/FrancoStino/opencode-skills-collection/commit/7be127dc324c64dfa43fd28ac5adca8350538df2) - remove DOMAIN_HEURISTICS dead code, rename heuristics.ts → constants.ts *(commit by [@FrancoStino](https://github.com/FrancoStino))*

### :wrench: Chores
- [`f8bd88a`](https://github.com/FrancoStino/opencode-skills-collection/commit/f8bd88a28f41a5550001ab02c563bbb00413eb5a) - update .gitignore to include IDE and project files *(commit by [@FrancoStino](https://github.com/FrancoStino))*
- [`18c7614`](https://github.com/FrancoStino/opencode-skills-collection/commit/18c7614170b921efd2cad406a02b583d07ff2274) - remove vault-manager.ts *(commit by [@FrancoStino](https://github.com/FrancoStino))*
- [`2e8ce3f`](https://github.com/FrancoStino/opencode-skills-collection/commit/2e8ce3f72635f11b19a929315ee7cae9d0c278b5) - remove categorizer.ts *(commit by [@FrancoStino](https://github.com/FrancoStino))*
- [`fe8d682`](https://github.com/FrancoStino/opencode-skills-collection/commit/fe8d682b2b1e4329b6867a9ca1fca09bf993de39) - rename package from opencode-skills-antigravity to opencode-skills-collection *(commit by [@FrancoStino](https://github.com/FrancoStino))*
- [`9c7f02e`](https://github.com/FrancoStino/opencode-skills-collection/commit/9c7f02edf73daad7fb2f029ef4f724422c68e7a6) - delete heuristics.ts *(commit by [@FrancoStino](https://github.com/FrancoStino))*
- [`d105437`](https://github.com/FrancoStino/opencode-skills-collection/commit/d1054376b2da275bee4f1c0f1446f524652231fc) - remove scripts/sync-index.mjs *(commit by [@FrancoStino](https://github.com/FrancoStino))*
- [`5c53a0e`](https://github.com/FrancoStino/opencode-skills-collection/commit/5c53a0e398a5c0023d0d9709f4dc344c853b16fe) - update skills_index.json *(commit by [@FrancoStino](https://github.com/FrancoStino))*
- [`f81aba9`](https://github.com/FrancoStino/opencode-skills-collection/commit/f81aba9f56e53abc8da2657c9cdd5cd3ed74922e) - update .gitignore to include .sisyphus directory *(commit by [@FrancoStino](https://github.com/FrancoStino))*
- [`a71b890`](https://github.com/FrancoStino/opencode-skills-collection/commit/a71b89046564c575171a51c5fc646bd0dad4c7d8) - remove outdated @opencode-ai/sdk entry from package-lock.json *(commit by [@FrancoStino](https://github.com/FrancoStino))*
- [`4ea8da1`](https://github.com/FrancoStino/opencode-skills-collection/commit/4ea8da1a31449aad4e9887aa8e35037171088b32) - bump version to 2.0.0-beta.1 *(commit by [@github-actions[bot]](https://github.com/apps/github-actions))*

[2.0.0-beta.1]: https://github.com/FrancoStino/opencode-skills-collection/compare/v1.0.196...2.0.0-beta.1
