# neighbor React Native App

Development of neighbor React Native App

## Setup

1. **Clone the repo**

  ```
  $ git clone https://github.com/smart-mickey/neighbor.git
  $ cd neighbor
  ```

2. **Install dependencies** (npm v3+):

  ```
  $ npm install
  $ react-native link
  ```
  
3. **Running on Android**:

  ```
  $ react-native run-android
  $ adb reverse tcp:8081 tcp:8081   # required to ensure the Android app can
  $ adb reverse tcp:8080 tcp:8080   # access the Packager and GraphQL server
  ```


4. **Running on iOS:**

  ```
  $ react-native run-ios
  ```
  
## Troubleshooting

> Could not connect to development server

In a separate terminal window run:

  ```
  $ react-native start
  ```
