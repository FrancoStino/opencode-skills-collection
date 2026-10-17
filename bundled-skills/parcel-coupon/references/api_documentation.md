# 快递优惠券API接口文档

## 接口信息

| 配置项 | 值 |
|--------|-----|
| 接口地址 | `https://agskills.moontai.top/coupon/parcel` |
| 请求方法 | GET |
| 认证方式 | 无需认证 |
| 返回格式 | JSON（数组） |

## 接口说明

获取快递一站式服务优惠券（智能寄件、智能匹配价格，单单享优惠），以及「更多优惠券」公众号领券入口。

## 请求示例

```
GET https://agskills.moontai.top/coupon/parcel
```

无请求参数，直接调用即可。

## 响应结构

```json
[
  {
    "title": "快递一站式服务，智能寄件，智能匹配价格；单单享优惠，件件有折扣",
    "coupon_url": "https://open.cdyunzhanxinxi.com/link/100058569b79be0bd2561000406SEVGA",
    "coupon_qrcode_img_url": "https://moontai-static.oss-cn-shenzhen.aliyuncs.com/coupon-parcel.png",
    "guideline": "点击链接下单(建议用微信打开)，或使用微信扫描二维码下单（单单享优惠）"
  },
  {
    "title": "更多优惠券！（外卖、电影、快递、旅游、打车)",
    "coupon_h5_qrcode_img_url": "https://moontai-static.oss-cn-shenzhen.aliyuncs.com/qrcode_for_gh.jpg",
    "guideline": "可以使用微信扫码后领券。关注不迷路，天天领券！"
  }
]
```

## 响应参数

| 字段路径 | 类型 | 说明 |
|----------|------|------|
| [].title | String | 优惠券标题 |
| [].coupon_url | String | **优惠券链接，原样呈现，禁止修改**，建议在微信中打开 |
| [].coupon_qrcode_img_url | String | **二维码图片URL，原样呈现，禁止修改**，建议使用微信扫码 |
| [].coupon_h5_qrcode_img_url | String | 公众号二维码图片URL（仅「更多优惠券」入口项有，微信扫码领全品类券） |
| [].guideline | String | 领取说明 |

## 重要说明

### URL 处理规则

**严格禁止修改 coupon_url / coupon_qrcode_img_url / coupon_h5_qrcode_img_url 字段的任何内容！**

- URL 链接必须原样保持
- 禁止添加空格、换行或任何格式化
- 禁止翻译、解释或重新排列链接顺序

## 错误码

| 情况 | 说明 |
|------|------|
| 正常返回 | 返回JSON数组数据 |
| 网络错误 | 返回"无法获取优惠券信息，请稍后重试" |
| 解析错误 | 返回"数据解析异常，请联系技术支持" |
