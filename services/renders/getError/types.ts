export type TErrorObject = {
    status: number;
}

export type TErrorContentlet = {
    contentlets: Array<{ identifier: string; title: string; [key: string]: any }>;
};