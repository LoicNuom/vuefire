import { initializeApp, cert, getApp, getApps } from 'firebase-admin/app'
import { VueFireAppCheckServer } from 'vuefire/server'
import type { FirebaseApp } from '@firebase/app-types'
import { defineNuxtPlugin, useAppConfig } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const appConfig = useAppConfig()

  const { firebaseConfig, firebaseAdmin, vuefireOptions } = appConfig

  // the admin sdk is not always needed, skip if not provided
  if (!firebaseAdmin?.config) {
    return
  }

  const firebaseApp = nuxtApp.$firebaseApp as FirebaseApp

  // only initialize the admin sdk once
  if (!getApps().length) {
    // this is specified when deployed on Firebase and automatically picks up the credentials from env variables
    if (process.env.GCLOUD_PROJECT) {
      initializeApp()
    } else {
      initializeApp({
        // TODO: is this really going to be used?
        ...firebaseAdmin.config,
        credential: cert(firebaseAdmin.serviceAccount),
      })
    }
  }

  const adminApp = getApp()
  if (vuefireOptions.appCheck) {
    // NOTE: necessary in VueFireAppCheckServer
    if (!firebaseApp.options.appId) {
      throw new Error(
        '[VueFire]: Missing "appId" in firebase config. This is necessary to use the app-check module on the server.'
      )
    }

    VueFireAppCheckServer(adminApp, firebaseApp)
  }

  return {
    provide: {
      adminApp,
    },
  }
})