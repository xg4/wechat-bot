import fetch from 'node-fetch'

export interface AtContent {
  /** userid的列表，提醒群中的指定成员(@某个成员)，@all表示提醒所有人，如果开发者获取不到userid，可以使用mentioned_mobile_list */
  mentioned_list?: string[]
  /** 手机号列表，提醒手机号对应的群成员(@某个成员)，@all表示提醒所有人 */
  mentioned_mobile_list?: string[]
}

export interface NewsContent {
  /** 标题，不超过128个字节，超过会自动截断 */
  title: string
  /** 描述，不超过512个字节，超过会自动截断 */
  description?: string
  /** 点击后跳转的链接 */
  url: string
  /** 图文消息的图片链接，支持JPG、PNG格式，较好的效果为大图 1068*455，小图150*150 */
  picurl?: string
}

export default class Bot {
  constructor(private webhook: string) {}

  private send(content: any) {
    return fetch(this.webhook, {
      method: 'POST',
      body: JSON.stringify(content),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(response => response.json())
      .then(result => (result.errcode ? Promise.reject(result) : result))
  }

  /**
   * 文本内容，最长不超过2048个字节，必须是utf8编码
   * 支持@群内成员
   * @param {string} content 消息内容
   * @param {AtContent} [at={}]
   * @returns
   * @memberof Bot
   */
  text(content: string, at: AtContent = {}) {
    return this.send({
      msgtype: 'text',
      text: {
        content,
        ...at
      }
    })
  }

  /**
   * markdown内容，最长不超过4096个字节，必须是utf8编码
   * @param {string} content 内容
   * @returns
   * @memberof Bot
   */
  markdown(content: string) {
    return this.send({
      msgtype: 'markdown',
      markdown: {
        content
      }
    })
  }

  /**
   * 消息类型，此时固定为image
   * 图片（base64编码前）最大不能超过2M，支持JPG,PNG格式
   * @param {string} base64 图片内容的base64编码
   * @param {string} md5 图片内容（base64编码前）的md5值
   * @returns
   * @memberof Bot
   */
  image(base64: string, md5: string) {
    return this.send({
      msgtype: 'image',
      image: {
        base64,
        md5
      }
    })
  }

  /**
   * 发送多图文链接
   * @param {NewsContent[]} articles 图文消息，一个图文消息支持1到8条图文
   * @returns
   * @memberof Bot
   */
  news(articles: NewsContent[]) {
    return this.send({
      msgtype: 'news',
      news: {
        articles
      }
    })
  }
}
