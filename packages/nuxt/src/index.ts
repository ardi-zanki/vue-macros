import { defineNuxtModule } from '@nuxt/kit'
import VueMacros from 'unplugin-vue-macros/vite'
import type { Options } from 'unplugin-vue-macros'
import type {} from '@nuxt/schema'
import type { Plugin } from 'vite'

export default defineNuxtModule<Options>({
  meta: {
    name: 'unplugin-vue-macros',
    configKey: 'macros',
  },
  defaults: {},
  setup(options, nuxt) {
    nuxt.hook('vite:extendConfig', (config) => {
      function findPluginAndRemove(name: string): Plugin | undefined {
        const idx = config.plugins!.findIndex(
          (plugin) => plugin && 'name' in plugin && plugin.name === name
        )
        if (idx === -1) return
        const plugin = config.plugins![idx]
        config.plugins!.splice(idx, 1)
        return plugin as any
      }
      config.plugins ||= []
      const vue = findPluginAndRemove('vite:vue')
      const vueJsx = findPluginAndRemove('vite:vue-jsx')

      config.plugins.push(
        VueMacros({
          ...options,
          plugins: {
            vue,
            vueJsx,
          },
        })
      )
    })

    nuxt.hook('prepare:types', (opts) => {
      opts.references.push({ types: 'unplugin-vue-macros/macros-global' })
    })

    nuxt.options.typescript.tsConfig ||= {}
    nuxt.options.typescript.tsConfig.vueCompilerOptions ||= {}
    nuxt.options.typescript.tsConfig.vueCompilerOptions.plugins ||= []
    nuxt.options.typescript.tsConfig.vueCompilerOptions.plugins.push(
      '@vue-macros/volar/define-model',
      // '@vue-macros/volar/short-vmodel',
      '@vue-macros/volar/define-slots'
    )
  },
})

declare module '@nuxt/schema' {
  interface NuxtConfig {
    macros?: Options
  }
  interface NuxtOptions {
    macros?: Options
  }
}