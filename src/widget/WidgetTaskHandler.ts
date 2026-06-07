import React from 'react';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { ScribleWidget } from './Widget';
import * as SecureStore from 'expo-secure-store';

export async function updateScribleWidget(data?: {
  type: 'text' | 'drawing' | 'photo' | 'sticker';
  content: string | null;
  mediaUrl: string | null;
  partnerName: string;
}) {
  try {
    if (data) {
      await SecureStore.setItemAsync('latest_widget_data', JSON.stringify(data));
    }
    
    const savedDataStr = await SecureStore.getItemAsync('latest_widget_data');
    const savedData = savedDataStr ? JSON.parse(savedDataStr) : null;

    requestWidgetUpdate({
      widgetName: 'Scrible',
      renderWidget: () => React.createElement(ScribleWidget, {
        messageType: savedData?.type,
        content: savedData?.content,
        mediaUrl: savedData?.mediaUrl,
        partnerName: savedData?.partnerName,
      }),
      widgetNotFound: () => {
        // Called if widget is not placed on the home screen
      }
    });
  } catch (e) {
    console.error('Failed to update widget', e);
  }
}
