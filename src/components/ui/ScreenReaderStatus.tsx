/**
 * Announces game progress to screen readers. Keep it mounted for the whole game
 * and only change the message: new live regions often aren't read aloud.
 */
export function ScreenReaderStatus({ message }: { message: string }) {
  return (
    <p role="status" className="sr-only">
      {message}
    </p>
  );
}
