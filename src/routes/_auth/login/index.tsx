import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

function RouteComponent() {
  
  return (
    <div className="text-center">
     login page
    </div>
  )

}
