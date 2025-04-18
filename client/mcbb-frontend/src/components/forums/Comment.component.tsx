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
 * @property {number} commentId - The unique identifier for the comment
 * @property {string} submitHandler - The function to handle comment submission
 */
interface CommentProps {
  creator: string;
  content: string;
  lastModified: Date;
  indentLevel?: number;
  commentInput: string;
  isReported: boolean;
  isDeleted: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
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
  commentInput,
  isReported,
  isDeleted,
  onChange,
  onKeyDown
}: CommentProps) => (
  <div
    className='flex flex-col gap-2 bg-gray-200 rounded-lg p-4'
    style={{ marginLeft: 20 * (indentLevel ?? 0) }}
  >
    <div className='flex items-center gap-4'>
      <div className='text-sm text-gray-500'>{!isDeleted ? creator : 'Deleted'}</div>
      <div className='text-sm text-gray-500'>{!isDeleted ? lastModified.toString() : '...'}</div>
      {!isDeleted && (
        <div className='flex-shrink-0'>
          <button
            className='text-sm text-gray-500 underline'
            aria-label='Report'
            name='report'
            type='submit'
            style={{
              cursor: isReported
                ? 'cursor'
                : 'cursor',
              color: isReported
                ? '#b1b1b1'
                : 'gray'
            }}
            disabled={isReported}
          >
            Report
          </button>
        </div>
      )}
    </div>
    <div className={`text-sm ${!isDeleted ? 'text-black' : 'text-gray-500 italic'}`}>
      {!isDeleted ? content : 'This comment has been deleted.'}
    </div>
    {!isDeleted && (
      <div className='flex flex-row w-full gap-2 items-center'>
        <Input
          label='Reply: '
          placeholder='Reply'
          name='comment'
          type='text'
          filled={false}
          value={commentInput}
          onChange={onChange}
          onKeyDown={onKeyDown}
          labelOnSameLine
        />
        <div className='flex-shrink-0'>
          <Button text='Reply' type='submit' filled={true} className='w-auto' />
        </div>
      </div>
    )}
  </div>
);

export default Comment;
