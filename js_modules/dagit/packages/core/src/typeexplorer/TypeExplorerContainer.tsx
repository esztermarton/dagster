import {gql, useQuery} from '@apollo/client';
import * as React from 'react';

import {PipelineExplorerPath} from '../pipelines/PipelinePathUtils';
import {Loading} from '../ui/Loading';
import {usePipelineSelector} from '../workspace/WorkspaceContext';

import {TypeExplorer, TYPE_EXPLORER_FRAGMENT} from './TypeExplorer';
import {
  TypeExplorerContainerQuery,
  TypeExplorerContainerQueryVariables,
} from './types/TypeExplorerContainerQuery';

interface ITypeExplorerContainerProps {
  explorerPath: PipelineExplorerPath;
  typeName: string;
}

export const TypeExplorerContainer: React.FunctionComponent<ITypeExplorerContainerProps> = ({
  explorerPath,
  typeName,
}) => {
  const pipelineSelector = usePipelineSelector(explorerPath.pipelineName);
  const queryResult = useQuery<TypeExplorerContainerQuery, TypeExplorerContainerQueryVariables>(
    TYPE_EXPLORER_CONTAINER_QUERY,
    {
      fetchPolicy: 'cache-and-network',
      variables: {
        pipelineSelector,
        dagsterTypeName: typeName,
      },
    },
  );
  return (
    <Loading queryResult={queryResult}>
      {(data) => {
        if (
          data.pipelineOrError &&
          data.pipelineOrError.__typename === 'Pipeline' &&
          data.pipelineOrError.dagsterTypeOrError &&
          data.pipelineOrError.dagsterTypeOrError.__typename === 'RegularDagsterType'
        ) {
          return <TypeExplorer type={data.pipelineOrError.dagsterTypeOrError} />;
        } else {
          return <div>Type Not Found</div>;
        }
      }}
    </Loading>
  );
};

const TYPE_EXPLORER_CONTAINER_QUERY = gql`
  query TypeExplorerContainerQuery(
    $pipelineSelector: PipelineSelector!
    $dagsterTypeName: String!
  ) {
    pipelineOrError(params: $pipelineSelector) {
      __typename
      ... on Pipeline {
        id
        dagsterTypeOrError(dagsterTypeName: $dagsterTypeName) {
          __typename
          ... on RegularDagsterType {
            ...TypeExplorerFragment
          }
        }
      }
    }
  }
  ${TYPE_EXPLORER_FRAGMENT}
`;
