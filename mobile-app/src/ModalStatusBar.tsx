import { useIsFocused } from '@react-navigation/native';
import { FC, ReactElement } from 'react';
import { Platform, StatusBar } from 'react-native';

type Props = {
  presentation: string | undefined;
  children: ReactElement;
};

// On iOS the stack's `modal` presentation pushes the underlying screen back
// and dims it, so the area under the status bar turns dark. The app-wide
// `dark-content` style from App.tsx would then be unreadable. Newer iOS
// versions adapt the color automatically, older ones (e.g. 26.x) don't.
const ModalStatusBar: FC<Props> = ({ presentation, children }) => {
  const isFocused = useIsFocused();

  return (
    <>
      {Platform.OS === 'ios' && presentation === 'modal' && isFocused && (
        <StatusBar barStyle="light-content" animated />
      )}
      {children}
    </>
  );
};

export const modalScreenLayout = ({
  options,
  children,
}: {
  options: { presentation?: string };
  children: ReactElement;
}) => (
  <ModalStatusBar presentation={options.presentation}>
    {children}
  </ModalStatusBar>
);
