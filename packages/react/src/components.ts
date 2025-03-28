import type { ReactNode } from 'react'
import type { ActiveHeadEntry, ResolvableHead as UseHeadInput } from 'unhead/types'
import React, { useCallback, useEffect, useRef } from 'react'
import { HasElementTags, TagsWithInnerContent, ValidHeadTags } from 'unhead/utils'
import { useUnhead } from './composables'

interface HeadProps {
  children: ReactNode
  titleTemplate?: string
}

const Head: React.FC<HeadProps> = ({ children, titleTemplate }) => {
  const head = useUnhead()

  const getHeadChanges = useCallback(() => {
    const input: UseHeadInput = {
      titleTemplate,
    }
    const elements = React.Children.toArray(children).filter(React.isValidElement)

    elements.forEach((element: React.ReactElement) => {
      const { type, props } = element

      if (!ValidHeadTags.has(type as string)) {
        return
      }
      const data: Record<string, any> = { ...(typeof props === 'object' ? props : {}) }
      if (TagsWithInnerContent.has(type as string) && data.children) {
        data[type === 'script' ? 'innerHTML' : 'textContent'] = Array.isArray(data.children) ? data.children.map(String).join('') : data.children
      }
      delete data.children
      if (HasElementTags.has(type as string)) {
        input[type as 'meta'] = input[type as 'meta'] || []
        // @ts-expect-error untyped
        input[type as 'meta']!.push(data)
      }
      else {
        // @ts-expect-error untyped
        input[type] = data
      }
    })
    return input
  }, [children, titleTemplate])

  const headRef = useRef<ActiveHeadEntry<any> | null>(
    head.push(getHeadChanges()),
  )

  useEffect(() => {
    return () => {
      if (headRef.current?.dispose) {
        headRef.current.dispose()
      }
      headRef.current = null
    }
  }, [])

  useEffect(() => {
    headRef.current?.patch(getHeadChanges())
  }, [getHeadChanges])

  return null
}

export { Head }
