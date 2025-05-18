import { useState } from 'react';
import { Container, Title, Text, FileInput, Button, Image, Stack, Group, Loader, Notification } from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';
import axios from 'axios';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiBase = import.meta.env.VITE_API_URL;

  const handleUpload = async () => {
    if (!file) {
      setError('Please select an image file.');
      return;
    }

    setError(null);
    setLoading(true);
    setImageURL(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(`${ apiBase }/analyze`, formData, {
        responseType: 'blob',
      });

      const blobURL = URL.createObjectURL(response.data);
      setImageURL(blobURL);
    } catch (err: any) {
      console.error('Upload error:', err);

      if (err.response) {
        const status = err.response.status;
        const message = await err.response.data.text?.();
        setError(`Server responded with ${status}: ${message || 'Unknown error'}`);
      } else if (err.request) {
        setError('No response from server. Please check network or server availability.');
      } else {
        setError(`Request failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Stack>
        <Title order={2}>Zone of Inhibition Measurement App</Title>
        <Text>
          Upload an image of an Agar Plate containing Antibiotic Disks. The application will automatically identify and measure Zones of Inhibition, then display as an overlay over the image.
        </Text>

        <FileInput
          label="Upload Image"
          placeholder="Select an image file"
          leftSection={<IconUpload size={16} />}
          accept="image/png,image/jpeg"
          value={file}
          onChange={setFile}
        />

        <Group>
          <Button onClick={handleUpload} disabled={loading || !file}>
            {loading ? <Loader size="xs" /> : 'Analyze Image'}
          </Button>
        </Group>

        {error && (
          <Notification color="red" onClose={() => setError(null)}>
            {error}
          </Notification>
        )}

        {imageURL && (
          <div>
            <Text mt="lg" mb="sm">Processed Image:</Text>
            <Image src={imageURL} alt="Processed result" radius="md"/>
            <Group mt="sm">
              <Button component="a" href={imageURL} download="output.png" variant="outline">
                Download Image
              </Button>
            </Group>
          </div>
        )}
      </Stack>
    </Container>
  );
}
