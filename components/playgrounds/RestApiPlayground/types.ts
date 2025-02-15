export type TFetchFn = {
    (): Promise<Response>;
}

export type TOption = {
    name: string;
    icon: string;
    codeRequest: string;
    fetchUrl: string;
    fetchFn: TFetchFn;
}