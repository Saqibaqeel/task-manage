import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Header from '../components/atoms/Header';
import DashBoard from '../features/dashboard/DashBoard';
import CreateTask from '../features/dashboard/CreateTask';
import BulkUpload from '../features/dashboard/BulkUpload';
import Export from '../features/dashboard/Export';

const Stack = createNativeStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <Header {...props} />,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen
        name="DashBoard"
        component={DashBoard}
        options={{
          title: 'TaskFlow',
          headerSubtitle: 'Your productivity space',
        }}
      />
      <Stack.Screen
        name="CreateTask"
        component={CreateTask}
        options={{
          title: 'Create task',
          headerSubtitle: 'Add something to your list',
        }}
      />
      <Stack.Screen
        name="BulkUpload"
        component={BulkUpload}
        options={{
          title: 'Import tasks',
          headerSubtitle: 'Upload tasks from a CSV file',
        }}
      />
      <Stack.Screen
        name="Export"
        component={Export}
        options={{
          title: 'Export tasks',
          headerSubtitle: 'Review and export as CSV',
        }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;