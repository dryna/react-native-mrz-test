import React, {useEffect, useRef} from 'react';
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


  useEffect(() => {
    MRZScanner.registerWithLicenseKey('PUT_YOUR_LICENCE_CODE_HERE')
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
      console.log('imageBase64', imageBase64)
      MRZScanner.scanImage(imageBase64)
    }
    setTimeout(() => takeBase64Picture(), 1000)
  }

  useEffect(() => {
    if (cameraRef && MRZScanner) {
      setTimeout(() => takeBase64Picture(), 2000)
    }
  }, [cameraRef, MRZScanner])

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
