import Button from '../formElements/Button.component';
import Input from '../formElements/Input.component';

/**
 * Represents the properties for the Comment component
 * 
 * @interface CommentProps
 * @property {string} creator - The name or identifier of the comment creator
 * @property {string} content - The text content of the comment
 * @property {Date} lastModified - The timestamp of when the comment was last modified
 * @property {number} [indentLevel=0] - Optional indentation level for nested comments
 */
interface CommentProps {
  creator: string;
  content: string;
  lastModified: Date;
  indentLevel?: number;
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
  indentLevel = 0
}: CommentProps) => {
  return (
    <div
      className='flex flex-col gap-2 bg-gray-200 rounded-lg p-4'
      style={{ marginLeft: 20 * indentLevel }}
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
          color='blue'
          filled={false}
          labelOnSameLine
        />
        <div className='flex-shrink-0'>
          <Button color='blue' text='Reply' filled={true} className='w-auto' />
        </div>
      </div>
    </div>
  );
};

export default Comment;
