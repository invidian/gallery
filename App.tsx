import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  FlatList,
  Image,
  TouchableHighlight,
} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import * as MediaLibrary from 'expo-media-library';
import ImageViewer from 'react-native-image-zoom-viewer';
import {StatusBar} from 'expo-status-bar';
import Icon from 'react-native-vector-icons/AntDesign';

class Gallery extends Component {
  imageBuffer = 500;
  onEndReachedThreshold = 0.5;

  mapImages(images) {
    const result = [];

    images.forEach(image => {
      result.push({
        url: image.uri,
        width: image.width,
        height: image.height,
      });
    });

    return result;
  }

  fetchImages(after, refreshing) {
    if (this.state.refreshing) {
      return;
    }

    this.setState({refreshing: true});

    const options = {
      first: this.imageBuffer,
      sortBy: [MediaLibrary.SortBy.creationTime],
    };

    if (after !== '') {
      options.after = after;
    }

    console.log('Fetching assets with options', options);

    MediaLibrary.getAssetsAsync(options).then(assetsPage => {
      const mappedImages = this.mapImages(assetsPage.assets);
      let assets = [...this.state.assets, ...mappedImages];

      if (refreshing) {
        assets = mappedImages;
      }

      this.setState({
        assets: assets,
        endCursor: assetsPage.endCursor,
        refreshing: false,
      });
    });
  }

  constructor(props) {
    super(props);

    this.state = {
      assets: [],
      endCursor: '',
      endReached: false,
      refreshing: false,
    };

    MediaLibrary.getPermissionsAsync().then(permissionResponse => {
      if (permissionResponse.granted) {
        this.fetchImages('', false);

        return;
      }

      MediaLibrary.requestPermissionsAsync().then(permissionResponse => {
        if (!permissionResponse.granted) {
          return;
        }

        this.fetchImages('', false);
      });
    });
  }

  render() {
    return (
      <FlatList
        data={this.state.assets}
        renderItem={({item, index}) => (
          <GalleryItem
            navigation={this.props.navigation}
            images={this.state.assets}
            index={index}
          />
        )}
        keyExtractor={item => item.url}
        numColumns={4}
        refreshing={this.state.refreshing}
        onRefresh={() => {
          this.fetchImages('', true);
        }}
        onEndReached={() => {
          this.fetchImages(this.state.endCursor, false);
        }}
        onEndReachedThreshold={this.onEndReachedThreshold}
      />
    );
  }
}

function GalleryItem({images, index, navigation}) {
  return (
    <TouchableHighlight
      style={{width: '25%', height: 100}}
      onPress={() => {
        navigation.navigate('ImageModal', {images: images, index: index});
      }}
    >
      <Image
        source={{uri: images[index].url}}
        style={{width: '100%', height: '100%'}}
      />
    </TouchableHighlight>
  );
}

function ImageModalIndicator(currentIndex, allSize) {
  return (
    <View style={{position: "absolute", zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.5)', height: '10%', width: '100%', justifyContent: 'center', alignItems: 'center'}}>
      <Icon.Button
        name="back"
        backgroundColor="rgba(0,0,0,0.0)"
        size={30}
        onPress={() => console.log("go back")}
      ></Icon.Button>
      <Text style={{color: 'white'}}>{currentIndex}Foo</Text>
    </View>
  );
}

function ImageModal({route, navigation}) {
  const {images} = route.params;
  const {index} = route.params;

  return (
    <View style={{flex: 1}}>
      <ImageViewer
        imageUrls={images}
        index={index}
        enableSwipeDown={true}
        onSwipeDown={() => navigation.goBack()}
        saveToLocalByLongPress={false}
        renderIndicator={ImageModalIndicator}
      />
    </View>
  );
}

const MainStack = createStackNavigator();
const RootStack = createStackNavigator();

function MainStackScreen() {
  return (
    <MainStack.Navigator initialRouteName="Gallery">
      <MainStack.Screen
        name="Gallery"
        options={{
          headerStyle: {backgroundColor: 'black'},
          headerTitleStyle: {color: 'white'},
        }}
        component={Gallery}
      />
    </MainStack.Navigator>
  );
}

function RootStackScreen() {
  return (
    <RootStack.Navigator mode="modal">
      <RootStack.Screen
        name="Main"
        component={MainStackScreen}
        options={{headerShown: false}}
      />
      <RootStack.Screen
        name="ImageModal"
        component={ImageModal}
        options={{headerShown: false}}
      />
    </RootStack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <RootStackScreen></RootStackScreen>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
