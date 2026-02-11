import { PostForm } from "../post-form";

export default function CreatePostPage() {
  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Vytvořit novou aktualitu</h1>
      <PostForm />
    </div>
  );
}
