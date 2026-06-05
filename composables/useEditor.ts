import { useRequestFetch } from 'nuxt/app'

const templates: Record<string, string> = {
  tech: '',
  'fresh-grad': '',
  management: '',
  blank: '',
}

export const useEditor = () => {
  const source = ref('')
  const currentTemplate = ref('blank')
  const fetch = useRequestFetch()

  const loadTemplate = async (name: string) => {
    if (!templates[name]) {
      const data = await fetch<string>(`/api/templates/${name}`)
      templates[name] = data
    }
    source.value = templates[name]
    currentTemplate.value = name
  }

  const updateSource = (value: string) => {
    source.value = value
  }

  return {
    source,
    currentTemplate,
    loadTemplate,
    updateSource,
  }
}
