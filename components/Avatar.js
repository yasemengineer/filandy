import { Image, StyleSheet } from 'react-native';
import { getAvatarById } from '../data/avatarKits';

export default function Avatar({ options, size = 200 }) {
  const { avatarId = 1 } = options || {};
  const avatar = getAvatarById(avatarId);

  return (
    <Image
      source={avatar.source}
      style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});