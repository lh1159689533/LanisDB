import { AppBar, Box, Toolbar, Button } from '@mui/material';
// import Search from '@components/search';

export default function Header({ items, ...rest }) {
  return (
    <Box {...rest} sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" sx={{ boxShadow: 'none', zIndex: 100 }} style={{ background: 'var(--lanis-db-primary-color)' }}>
        <Toolbar variant="dense" sx={{ minHeight: 42 }}>
          <Box sx={{ flexGrow: 1, display: 'flex' }}>
            {items.map((item) => (
              <Button
                key={item.key}
                onClick={item.handle}
                sx={{
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                color='inherit'
              >
                {item.icon}
                {item.title}
              </Button>
            ))}
          </Box>
          {/* <Search /> */}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
