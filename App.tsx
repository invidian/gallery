import React, { Component } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Button, FlatList, Image, TouchableHighlight } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as MediaLibrary from 'expo-media-library';

const Stack = createStackNavigator();

class Gallery extends Component {
  imageBuffer = 500;
  onEndReachedThreshold = 0.5;

  fetchImages(after, refreshing) {
    if (this.state.refreshing) {
      return
    };

    this.setState({refreshing: true});

    options = {
      first: this.imageBuffer,
      sortBy: [MediaLibrary.SortBy.creationTime],
    };

    if (after != '') {
      options.after = after
    };

    console.log("Fetching assets with options", options);

    MediaLibrary.getAssetsAsync(options).then(assetsPage => {
      let assets = [...this.state.assets, ...assetsPage.assets];

      if (refreshing) {
        assets = assetsPage.assets
      };

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
        this.fetchImages("", false);

        return
      }

      MediaLibrary.requestPermissionsAsync().then(permissionResponse => {
        if (!permissionResponse.granted) {
          return
        }

        this.fetchImages("", false);
      });
    });
  }

  render() {
    return (
      <SafeAreaView>
        <FlatList
          data={this.state.assets}
          renderItem={({item}) => <Item uri={item.uri} navigation={this.props.navigation}/>}
          keyExtractor={item => item.uri}
          numColumns={4}
          refreshing={this.state.refreshing}
          onRefresh={() => { this.fetchImages('', true); }}
          onEndReached={() => { this.fetchImages(this.state.endCursor, false); }}
          onEndReachedThreshold={this.onEndReachedThreshold}
        />
      </SafeAreaView>
    );
  }
}

function Item({uri, navigation}) {
  return (
    <TouchableHighlight style={{width: '25%', height: 100}}  onPress={() => console.log("image pressed", uri)}>
      <Image source={{uri: uri}} style={{width: '100%', height: '100%'}} />
    </TouchableHighlight>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Gallery">
          <Stack.Screen name="Gallery" component={Gallery} />
        </Stack.Navigator>
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
