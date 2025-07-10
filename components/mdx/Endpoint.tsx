'use client'

import React from 'react';
import SingleEndpointSwaggerUI from '../playgrounds/SingleEndpointSwaggerUI/SingleEndpointSwaggerUI';

interface EndpointProps {
  method: string;
  path: string;
}

const Endpoint: React.FC<EndpointProps> = ({ method, path }) => {
  return (
    <SingleEndpointSwaggerUI
      method={method}
      path={path}
    />
  );
};

export default Endpoint; 