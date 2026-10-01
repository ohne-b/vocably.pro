import { CardItem, DeckSettings, isGoogleTTSLanguage } from '@vocably/model';
import { isGoodPlural, sanitizeTranscript } from '@vocably/sulna';
import React, { FC, useEffect, useRef, useState } from 'react';
import { PixelRatio, Platform, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text, useTheme } from 'react-native-paper';
import { CardExample, CardExampleRef } from '../../CardExample';
import { isolate } from '../../isolate';
import { PlaySound, PlaySoundRef } from '../../PlaySound';
import { studySmallFontSize } from '../../styles';

type Props = {
  card: CardItem;
  autoPlay: boolean;
  playRandomExample: boolean;
  showInflections?: boolean;
  onPress?: () => unknown;
  deckSettings: DeckSettings;
};

// Explicit line height lets PlaySound be centered against the first line.
const sourceLineHeight = 40;

export const CardFront: FC<Props> = ({
  card,
  autoPlay,
  playRandomExample,
  showInflections = false,
  onPress,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [isAutoPlayed, setIsAutoPlayed] = useState(false);
  const playRef = useRef<PlaySoundRef>(null);
  const cardExampleRef = useRef<CardExampleRef>(null);

  useEffect(() => {
    if (!autoPlay) {
      return;
    }

    if (isAutoPlayed) {
      return;
    }

    if (!playRef.current) {
      return;
    }

    playRef.current.play().then(() => {
      if (cardExampleRef.current && playRandomExample) {
        cardExampleRef.current.play();
      }
    });
    setIsAutoPlayed(true);
  }, [isAutoPlayed, autoPlay]);

  const present = card.data.presentTenses
    ? t('common.presentTenses', { value: isolate(card.data.presentTenses) })
    : false;
  const past =
    card.data.tense === 'present' && card.data.pastTenses
      ? t('common.pastTenses', { value: isolate(card.data.pastTenses) })
      : false;

  const presentAndPast = [present, past].filter(Boolean).join(`\n`);

  const fontScale = PixelRatio.getFontScale();

  return (
    <View>
      <View
        style={{
          // No wrapping: the source wraps inside its own Text so that
          // PlaySound and the first word always stay on the same line.
          flexDirection: 'row',
          alignItems: 'flex-start',
          columnGap: 8,
          width: '100%',
          // Keep LTR order even when the card is in an RTL language.
          direction: 'ltr',
        }}
      >
        {isGoogleTTSLanguage(card.data.language) && (
          <PlaySound
            text={card.data.source}
            language={card.data.language}
            size={24}
            ref={playRef}
            // Center the icon against the first line of the source.
            style={{
              height: sourceLineHeight * fontScale,
              justifyContent: 'center',
              transform: [
                {
                  translateX: 2,
                },
                {
                  translateY:
                    Platform.OS === 'ios' ? 3 * fontScale : 2 * 1.2 * fontScale,
                },
              ],
            }}
          />
        )}
        <Text
          style={{
            fontSize: 32,
            lineHeight: sourceLineHeight,
            color: theme.colors.secondary,
            flexShrink: 1,
          }}
        >
          {card.data.source}
        </Text>
      </View>
      {(card.data.ipa ||
        card.data.partOfSpeech ||
        card.data.g ||
        (showInflections && presentAndPast)) && (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginLeft: 8,
            marginTop: 6,
            gap: 8,
            direction: 'ltr',
          }}
        >
          {card.data.ipa && <Text>/{sanitizeTranscript(card.data.ipa)}/</Text>}
          {card.data.g && <Text>({isolate(card.data.g)})</Text>}
          {card.data.partOfSpeech && (
            <Text>
              {t(`language.${card.data.partOfSpeech}`, card.data.partOfSpeech)}
            </Text>
          )}
          {showInflections && presentAndPast && <Text>{presentAndPast}</Text>}
          {showInflections &&
            card.data.number === 'singular' &&
            isGoodPlural(card.data.pluralForm) && (
              <Text>
                {t('common.plural', {
                  value: isolate(card.data.pluralForm),
                })}
              </Text>
            )}
        </View>
      )}
      {card.data.example && (
        <View style={{ marginTop: 12, marginLeft: 8 }}>
          <CardExample
            ref={cardExampleRef}
            example={card.data.example}
            textStyle={{ fontSize: studySmallFontSize }}
            language={card.data.language}
            onPress={onPress}
          />
        </View>
      )}
    </View>
  );
};
