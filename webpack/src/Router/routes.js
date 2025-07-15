import React from 'react';
import AiTemplatesPage from './AiTemplatesPage';

const routes = [
  {
    path: '/ai_templates',
    exact: true,
    render: (props) => <AiTemplatesPage {...props} />,
  },
];

export default routes;
