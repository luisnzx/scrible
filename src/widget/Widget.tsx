import React from 'react';
import { FlexWidget, TextWidget, ImageWidget } from 'react-native-android-widget';

interface ScribleWidgetProps {
  messageType?: 'text' | 'drawing' | 'photo' | 'sticker';
  content?: string;
  mediaUrl?: string;
  partnerName?: string;
}

export function ScribleWidget({
  messageType,
  content,
  mediaUrl,
  partnerName,
}: ScribleWidgetProps) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#1A1A2E',
        borderRadius: 16,
        padding: 16,
        justifyContent: 'space-between',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <TextWidget
          text="💕 "
          style={{ fontSize: 16, color: '#FFFFFF' }}
        />
        <TextWidget
          text={partnerName ? `De ${partnerName}` : 'Scrible'}
          style={{
            fontSize: 14,
            fontFamily: 'sans-serif-medium',
            color: '#FFFFFF',
          }}
        />
      </FlexWidget>

      {/* Content */}
      <FlexWidget
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#0F0F1A',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        {!messageType ? (
          <TextWidget
            text="Sin mensajes nuevos"
            style={{ fontSize: 14, color: '#6B6B8A' }}
          />
        ) : messageType === 'text' ? (
          <TextWidget
            text={content || ''}
            style={{
              fontSize: 16,
              color: '#FFFFFF',
              textAlign: 'center',
            }}
          />
        ) : messageType === 'sticker' ? (
          <TextWidget
            text={content || '😍'}
            style={{ fontSize: 48 }}
          />
        ) : (messageType === 'drawing' || messageType === 'photo') ? (
          <TextWidget
            text={messageType === 'drawing' ? '🎨 Nuevo dibujo' : '📸 Nueva foto'}
            style={{ fontSize: 24, color: '#FFFFFF' }}
          />
        ) : null}
      </FlexWidget>
    </FlexWidget>
  );
}
