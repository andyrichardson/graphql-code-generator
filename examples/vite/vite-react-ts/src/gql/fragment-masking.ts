import { ResultOf, DocumentTypeDecoration, TypedDocumentNode } from '@graphql-typed-document-node/core';
import { FragmentDefinitionNode } from 'graphql';

export type FragmentType<TDocumentType extends DocumentTypeDecoration<any, any>> =
  TDocumentType extends DocumentTypeDecoration<infer TType, any>
    ? TType extends { ' $fragmentName'?: infer TKey }
      ? TKey extends string
        ? { ' $fragmentRefs'?: { [key in TKey]: TType } }
        : never
      : never
    : never;

// return non-nullable if `fragmentType` is non-nullable
export function useFragment<TType>(
  _documentNode: DocumentTypeDecoration<TType, any>,
  fragmentType: FragmentType<DocumentTypeDecoration<TType, any>>
): TType;
// return nullable if `fragmentType` is nullable
export function useFragment<TType>(
  _documentNode: DocumentTypeDecoration<TType, any>,
  fragmentType: FragmentType<DocumentTypeDecoration<TType, any>> | null | undefined
): TType | null | undefined;
// return array of non-nullable if `fragmentType` is array of non-nullable
export function useFragment<TType>(
  _documentNode: DocumentTypeDecoration<TType, any>,
  fragmentType: ReadonlyArray<FragmentType<DocumentTypeDecoration<TType, any>>>
): ReadonlyArray<TType>;
// return array of nullable if `fragmentType` is array of nullable
export function useFragment<TType>(
  _documentNode: DocumentTypeDecoration<TType, any>,
  fragmentType: ReadonlyArray<FragmentType<DocumentTypeDecoration<TType, any>>> | null | undefined
): ReadonlyArray<TType> | null | undefined;
export function useFragment<TType>(
  _documentNode: DocumentTypeDecoration<TType, any>,
  fragmentType:
    | FragmentType<DocumentTypeDecoration<TType, any>>
    | ReadonlyArray<FragmentType<DocumentTypeDecoration<TType, any>>>
    | null
    | undefined
): TType | ReadonlyArray<TType> | null | undefined {
  return fragmentType as any;
}

export function makeFragmentData<F extends DocumentTypeDecoration<any, any>, FT extends ResultOf<F>>(
  data: FT,
  _fragment: F
): FragmentType<F> {
  return data as FragmentType<F>;
}

export function isFragmentReady<TQuery, TFrag>(
  queryNode: DocumentTypeDecoration<TQuery, any>, // works with strings
  fragmentNode: TypedDocumentNode<TFrag>, // doesn't work with strings yet
  data: TQuery
): data is FragmentType<typeof fragmentNode> {
  const deferredFields = (queryNode as { __meta__?: { deferredFields: Record<string, string[]> } }).__meta__
    ?.deferredFields;
  if (deferredFields) {
    const fragDef = fragmentNode.definitions[0] as FragmentDefinitionNode | undefined;
    const fragName = fragDef?.name?.value;
    const fields = fragName ? deferredFields[fragName] : [];

    return fields.length > 0 && fields.some(field => field in (data as any));
  }

  return true;
}
