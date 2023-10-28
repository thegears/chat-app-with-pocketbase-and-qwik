import { component$, useSignal, useStore, $, useVisibleTask$ } from "@builder.io/qwik";
import { isServer } from '@builder.io/qwik/build';
import type { DocumentHead } from "@builder.io/qwik-city";
import { newMessage, getMessages } from "~/services/messagesService";
import { PB } from '~/services/pocketbase';

export default component$(() => {

  const name = useSignal(""); // isim ve mesaj statelerimiz
  const content = useSignal("");
  const isError = useSignal(false);

  const messages = useStore<{ list: { author: string, content: string, date: string }[] | [] }>({
    list: []
  })

  const sendMessage = $(async () => {
    const res = await newMessage(name.value, content.value);

    if (res == true) {
      content.value = "";
    } else {
      isError.value = true;
      setTimeout(() => {
        isError.value = false;
      }, 3000);
    }
  });

  useVisibleTask$(({ track }) => {
    track(() => messages.list.length);
    if (isServer) {
      return;
    }
    const objDiv = document.getElementById("messages");
    objDiv!.scrollTop = objDiv!.scrollHeight;
  });

  useVisibleTask$(async () => {

    const allMessages = await getMessages();

    const mappedAllMessages: { author: string, content: string, date: string }[] = allMessages.map(m => {
      return {
        author: String(m.author),
        content: String(m.content),
        date: m.created
      }
    })

    messages.list = mappedAllMessages


    PB.collection('messages').subscribe('*', async (e) => {
      // @ts-ignore
      messages.list.push({
        author: String(e.record.author),
        content: String(e.record.content),
        date: String(e.record.created)
      })

    });


  }, { strategy: 'document-ready' })

  return (
    <div class="h-screen w-full flex justify-center items-center align-center">
      {
        (isError.value) && <div class="absolute w-2/6 bottom-1 alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>Mesaj gönderilemedi!</span>
        </div>
      }
      <div class="w-4/6 h-5/6 bg-gray-700 p-5">
        <div id='messages' class="w-full overflow-auto" style={'height: 90%'}>
          {
            messages.list.map((message, index) => <div key={index}>
              <div class="chat chat-start">
                <div class="chat-header">
                  {message.author}
                </div>
                <div class="chat-bubble">{message.content}</div>
                <div class="chat-footer">
                  {message.date.split(".")[0]}
                </div>
              </div>
            </div>)
          }
        </div>
        <div class="w-full flex flex-wrap justify-around" style={'height: 10%'}>
          <div class="w-full h-px mb-2 bg-white"></div>
          <input bind: value={name} class='input w-1/6 input-bordered input-ghost' name='name' autoComplete={'true'} placeholder='isim' />
          <input bind: value={content} class='input w-4/6 input-bordered input-ghost' name='content' placeholder='mesaj' />
          <button onClick$={() => { sendMessage() }} class='btn btn-outline'>Gönder</button>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
