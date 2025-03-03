import Button from '../formElements/Button.component';
import Input from '../formElements/Input.component';
import { useState } from 'react';

/**
 * Represents the properties for the Comment component
 *
 * @interface CommentProps
 * @property {string} creator - The name or identifier of the comment creator
 * @property {string} content - The text content of the comment
 * @property {Date} lastModified - The timestamp of when the comment was last modified
 * @property {number} [indentLevel=0] - Optional indentation level for nested comments
 * @property {number} commentId - The unique identifier for the comment
 * @property {string} submitHandler - The function to handle comment submission
 */
interface CommentProps {
  creator: string;
  content: string;
  lastModified: Date;
  indentLevel?: number;
  commentId: number;
  submitHandler: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  commentInput: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Renders a comment with creator details, content, and a reply input
 *
 * @component
 * @param {CommentProps} props - The properties for the Comment component
 * @returns {JSX.Element} A styled comment card with creator info, content, and reply functionality
 *
 * @example
 * <Comment
 *   creator="John Doe"
 *   content="This is a sample comment"
 *   lastModified={new Date()}
 *   indentLevel={1}
 *   commentId={1}
 * />
 *
 * @remarks
 * - Supports nested comments through the indentLevel prop
 * - Includes a built-in reply input and button
 * - Displays creator name, timestamp, and a report option
 */
const Comment = ({
  creator,
  content,
  lastModified,
  indentLevel,
  commentId,
  submitHandler,
  commentInput,
  onChange
}: CommentProps) => {
  /*const submit = useSubmit();
  const location = useLocation();
  // console.log('location: ', location.pathname);
  const eventId = location.pathname.split('/')[3];
  // console.log('event id: ', eventId);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const comment = formData.get('comment')?.toString() || '';
    const action = (
      (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
    ).name;

    if (comment === '') {
      
    } else {
      formData.append('action', action);
      formData.append('parentId', commentId.toString());
      formData.append('eventId', eventId);
      formData.append('indentLevel', (indentLevel ?? 0).toString());
      console.log("parent id form data: ", commentId.toString());
      console.log('comment event id: ', eventId);

      submit(
        {
          comment: comment,
          parentId: commentId.toString(),
          eventId: eventId,
          action: 'subComment',
          indentLevel: ((indentLevel ?? 0) + 1).toString()
        },
        {method: 'POST'}
      )
    }
  };*/
  return (
    <div
      className='flex flex-col gap-2 bg-gray-200 rounded-lg p-4'
      style={{ marginLeft: 20 * (indentLevel ?? 0) }}
    >
      <div className='flex items-center gap-4'>
        <div className='text-sm text-gray-500'>{creator}</div>
        <div className='text-sm text-gray-500'>{lastModified.toString()}</div>
        <div className='text-sm text-gray-500 underline'>Report this</div>
      </div>
      <div className='text-sm text-black'>{content}</div>
      <div className='flex flex-row w-full gap-2 items-center'>
        <Input
          label='Reply: '
          placeholder='Reply'
          name='comment'
          type='text'
          filled={false}
          value={commentInput}
          onChange={onChange}
          labelOnSameLine
        />
        <div className='flex-shrink-0'>
          <Button
            text='Reply'
            type='submit'
            filled={true}
            className='w-auto' />
        </div>
      </div>
    </div>
  );
};

export default Comment;
