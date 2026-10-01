import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation } from '@react-navigation/native';
import { Card, isGoogleTTSLanguage, TagItem } from '@vocably/model';
import { isGoodPlural, sanitizeTranscript } from '@vocably/sulna';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PixelRatio,
  Platform,
  Pressable,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import {
  ActivityIndicator,
  Chip,
  Divider,
  Portal,
  Snackbar,
  Text,
  useTheme,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CardDefinition } from './CardDefinition';
import { CardExample } from './CardExample';
import { isolate } from './isolate';
import { PlaySound } from './PlaySound';

type Props = {
  card: Card;
  style?: StyleProp<ViewStyle>;
  showExamples?: boolean;
  savingTagsInProgress?: boolean;
  onTagsChange?: (tags: TagItem[]) => Promise<any>;
  onLookUpModalOpen?: () => void;
  allowCopy?: boolean;
  aiButton?: 'dimmed' | 'bright' | 'none';
  disabledModalLookup?: boolean;
  hideDefinitions?: boolean;
};

// Explicit line height lets PlaySound be centered against the first line.
const sourceLineHeight = 30;

export const CardListItem: FC<Props> = ({
  card,
  style,
  showExamples = false,
  savingTagsInProgress = false,
  onTagsChange = () => null,
  onLookUpModalOpen,
  allowCopy = false,
  aiButton = 'dimmed',
  disabledModalLookup = false,
  hideDefinitions = false,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();

  const onTagClose = (tagToRemove: TagItem) => () => {
    onTagsChange(card.tags.filter((t) => t.id !== tagToRemove.id));
  };

  const [copied, setCopied] = useState(false);

  const fontScale = PixelRatio.getFontScale();

  const present = card.presentTenses
    ? t('common.presentTenses', { value: isolate(card.presentTenses) })
    : false;
  const past =
    card.tense === 'present' && card.pastTenses
      ? t('common.pastTenses', { value: isolate(card.pastTenses) })
      : false;

  const presentAndPast = [present, past].filter(Boolean).join(`\n`);

  return (
    <View style={style}>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          columnGap: 8,
          rowGap: 2,
          width: '100%',
          // Keep LTR order even when the card is in an RTL language.
          direction: 'ltr',
        }}
      >
        {/* No wrapping: the source wraps inside its own Text so that
            PlaySound and the first word always stay on the same line. */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            columnGap: 8,
            flexShrink: 1,
          }}
        >
          {isGoogleTTSLanguage(card.language) && (
            <PlaySound
              text={card.source}
              language={card.language}
              size={22}
              // Center the icon against the first line of the source.
              style={{
                height: sourceLineHeight * fontScale,
                justifyContent: 'center',
                transform: [{ translateY: Platform.OS === 'android' ? 2 : 3 }],
              }}
            />
          )}
          <Text
            style={{
              fontSize: 24,
              lineHeight: sourceLineHeight,
              color: theme.colors.secondary,
              flexShrink: 1,
            }}
          >
            {card.source}
          </Text>
        </View>
        {allowCopy && (
          <Pressable
            hitSlop={10}
            onPress={() => {
              Clipboard.setString(card.source);
              !copied && setCopied(true);
            }}
            style={({ pressed }) => ({
              opacity: pressed ? 0.4 : 1,
            })}
          >
            <Icon
              name="content-copy"
              size={17 * fontScale}
              color={theme.colors.onSurface}
            />
          </Pressable>
        )}
        {aiButton !== 'none' && (
          <Pressable
            hitSlop={10}
            onPress={() => {
              // @ts-ignore
              navigation.navigate('ChatWithCardModal', {
                card,
              });
            }}
            style={({ pressed }) => ({
              opacity: pressed ? 0.4 : 1,
              marginHorizontal: 8,
            })}
          >
            <Icon
              name="creation"
              size={17 * fontScale}
              color={
                aiButton === 'bright'
                  ? theme.colors.primary
                  : theme.colors.onSurface
              }
            />
          </Pressable>
        )}
        {card.ipa && <Text>/{sanitizeTranscript(card.ipa)}/</Text>}
        {card.g && <Text>({isolate(card.g)})</Text>}
        {card.partOfSpeech && (
          <Text>{t(`language.${card.partOfSpeech}`, card.partOfSpeech)}</Text>
        )}
        {presentAndPast && (
          <Text style={{ width: '100%' }}>{presentAndPast}</Text>
        )}
        {card.number === 'singular' && isGoodPlural(card.pluralForm) && (
          <Text>
            {t('common.plural', {
              value: isolate(card.pluralForm),
            })}
          </Text>
        )}
      </View>
      {allowCopy && (
        <Portal>
          <Snackbar
            visible={copied}
            onDismiss={() => copied && setCopied(false)}
            duration={2000}
          >
            {t('exportDeck.copiedToClipboard')}
          </Snackbar>
        </Portal>
      )}
      <View style={{ marginTop: 8 }}>
        <CardDefinition
          card={card}
          onLookUpModalOpen={onLookUpModalOpen}
          lookUpDisabled={disabledModalLookup}
          hideDefinitions={hideDefinitions}
        />
      </View>
      {showExamples && card.example && (
        <View style={{ marginTop: 8 }}>
          <Text style={{ fontWeight: 'bold' }}>{t('common.examples')}</Text>
          <CardExample
            onLookUpModalOpen={onLookUpModalOpen}
            example={card.example}
            language={card.language}
            lookUpDisabled={disabledModalLookup}
          />
        </View>
      )}
      {(card.tags.length > 0 || savingTagsInProgress) && (
        <View
          style={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            minHeight: 36,
          }}
        >
          {card.tags.map((tag) => (
            <Chip
              key={tag.id}
              selectedColor={theme.colors.onSurface}
              mode="outlined"
              onClose={onTagClose(tag)}
            >
              {tag.data.title}
            </Chip>
          ))}
          {savingTagsInProgress && (
            <ActivityIndicator color={theme.colors.onBackground} />
          )}
        </View>
      )}
    </View>
  );
};

export const Separator: FC = () => <Divider style={{ zIndex: 1 }} />;
