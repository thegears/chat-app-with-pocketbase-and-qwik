import { PB } from './pocketbase';

export const newMessage = async (name: string, content: string) => {
  try {
    await PB.collection('messages').create({
      author: name,
      content
    });

    return true

  } catch (e: any) {
    return e?.data?.data
  }

};

export const getMessages = async () => {
  const records = await PB.collection('messages').getFullList({
    sort: 'created',
  });

  return records;
};
