import React, {useEffect, useRef, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  StatusBar,
} from 'react-native';

import { NativeEventEmitter, NativeModules } from 'react-native'
import { RNCamera } from 'react-native-camera'

declare const global: {HermesInternal: null | {}};

const App = () => {
  const MRZScanner = NativeModules.RNMrzscannerlib
  const MRZScannerEventEmmiter = new NativeEventEmitter(MRZScanner)

  const cameraRef = useRef<any>()

  const [picture, setPicture] = useState<string>()


  useEffect(() => {
    MRZScanner.registerWithLicenseKey('6F86DBC3FBD98C4F0A15A79B80541F54CE486E672B2E9B0D93EA29A3AB013961908457358FFDEF1356594179548728E7')
    MRZScanner.setMaxThreads(2)
    MRZScanner.setContinuousScanningEnabled(true)
    MRZScanner.setIgnoreDuplicatesEnabled(false)

    MRZScannerEventEmmiter.addListener('successfulScanEmittedEvent', async (data) => {
      console.log('successfulScanEmittedEvent', data)
    })

    MRZScannerEventEmmiter.addListener('scanImageFailedEmittedEvent', async (data) => {
      console.log('scanImageFailedEmittedEvent', data)
    })

    return () => {
      MRZScannerEventEmmiter.removeAllListeners('successfulScanEmittedEvent')
      MRZScannerEventEmmiter.removeAllListeners('scanImageFailedEmittedEvent')
    }
  }, [])

  const takeBase64Picture = async () => {
    const options = { quality: 1, base64: true, doNotSave: true }
    const { base64: imageBase64 } = await cameraRef.current.takePictureAsync(options)
    if (imageBase64) {
      setPicture(imageBase64)
    }
    setTimeout(() => takeBase64Picture(), 1000)
  }

  useEffect(() => {
    if (cameraRef && MRZScanner) {
      setTimeout(() => takeBase64Picture(), 2000)
    }
  }, [cameraRef, MRZScanner])

  useEffect(() => {
    if (picture) {
      console.log('pictureBase64', picture)
      MRZScanner.scanImage(picture)
    }
  }, [picture])

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <View
          style={{
            height: 200,
          }}
        >
          <RNCamera
            ref={cameraRef}
            style={{
              height: 200,
              opacity: 100,
            }}
            type={RNCamera.Constants.Type.back}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
});

export default App;
