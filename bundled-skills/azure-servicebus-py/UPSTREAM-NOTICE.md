# Upstream helpers for azure-servicebus-py

The files listed below were recovered from [microsoft/skills](https://github.com/microsoft/skills) at commit `fc164ba1d7a0c10377dbcc1c9ac07253b9329fdb`. The repository ID is `1135891523`.

They retain the upstream **MIT** license reproduced in [UPSTREAM-LICENSE.txt](UPSTREAM-LICENSE.txt). This notice applies to the listed support files; it does not replace the license metadata of other catalog files. Preserve the upstream license and this attribution when redistributing them.

License wording is unchanged; text-only trailing whitespace and EOF blank lines are normalized. Original license: https://github.com/microsoft/skills/blob/fc164ba1d7a0c10377dbcc1c9ac07253b9329fdb/LICENSE

| Local file | Original upstream path | Original Git blob SHA | Import changes |
| --- | --- | --- | --- |
| `references/patterns.md` | `.github/plugins/azure-sdk-python/skills/azure-servicebus-py/references/patterns.md` | `da07528473b19ff05822764585a44eecde60fe50` | text-only trailing whitespace and EOF blank lines normalized |
| `references/dead-letter.md` | `.github/plugins/azure-sdk-python/skills/azure-servicebus-py/references/dead-letter.md` | `7effe7e98ebefdd1762db841a44d84b064b59d0c` | text-only trailing whitespace and EOF blank lines normalized |
| `scripts/setup_servicebus.py` | `.github/plugins/azure-sdk-python/skills/azure-servicebus-py/scripts/setup_servicebus.py` | `46a01dfb88379a15d574d737dcc3ef2be89b7855` | AAS safety adaptation: destructive delete subcommands require the explicit --confirm-delete acknowledgement |

`scripts/setup_servicebus.py` performs authenticated reads and can create or delete queues, topics, and subscriptions. Delete commands now require `--confirm-delete`; subscription creation with `--filter` replaces the default rule on the newly created subscription. Confirm the namespace and exact entity/action before live use and prefer a disposable test namespace. No cloud calls were made during restoration.
