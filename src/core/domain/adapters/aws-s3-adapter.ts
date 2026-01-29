interface ObjectUrl {
  uploadUrl: string;
  photoUrl: string;
}

export interface StorageServiceAdapter {
  sendObject(key: string, bucketName: string): Promise<ObjectUrl>;
}
