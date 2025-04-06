import { defineHeadPlugin } from './defineHeadPlugin'

export interface InferSeoMetaPluginOptions {
  /**
   * Transform the og title.
   *
   * @param title
   */
  ogTitle?: ((title?: string) => string)
  /**
   * Transform the og description.
   *
   * @param title
   */
  ogDescription?: ((description?: string) => string)
  /**
   * The twitter card to use.
   *
   * @default 'summary_large_image'
   */
  twitterCard?: false | 'summary' | 'summary_large_image' | 'app' | 'player'
}

export function InferSeoMetaPlugin(options: InferSeoMetaPluginOptions = {}) {
  return defineHeadPlugin((head) => {
    head.push({
      meta: [
        {
          name: 'twitter:card',
          content: options.twitterCard || 'summary_large_image',
          tagPriority: 'low',
        },
        {
          'property': 'og:title',
          'tagPriority': 'low',
          'data-infer': '',
        },
        {
          'property': 'og:description',
          'tagPriority': 'low',
          'data-infer': '',
        },
      ],
    })
    return {
      key: 'infer-seo-meta',
      hooks: {
        'tags:beforeResolve': ({ tagMap }) => {
          let title = head._titleTemplate || head._title
          // check if the current title is %infer
          const ogTitle = tagMap.get('meta:og:title')
          if (typeof ogTitle?.props['data-infer'] !== 'undefined') {
            if (typeof title === 'function') {
              // @ts-expect-error untyped
              title = title(head._title)
            }
            ogTitle.props!.content = options.ogTitle ? options.ogTitle(title) : title || ''
            ogTitle.processTemplateParams = true
          }

          const description = tagMap.get('meta:description')?.props?.content
          const ogDescription = tagMap.get('meta:og:description')
          if (typeof ogDescription?.props['data-infer'] !== 'undefined') {
            ogDescription.props!.content = options.ogDescription ? options.ogDescription(description) : description || ''
            ogDescription.processTemplateParams = true
          }
        },
      },
    }
  })
}
