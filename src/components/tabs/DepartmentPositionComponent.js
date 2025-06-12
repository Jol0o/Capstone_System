"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner";

// Import your API functions
import {
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getPositions,
    getDepartments,
    createPosition,
    updatePosition,
    deletePosition
} from "@/lib/api" // <-- adjust path as needed

export default function DepartmentPositionComponent() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState("add")
    const [activeTab, setActiveTab] = useState("departments")
    const [editingItem, setEditingItem] = useState(null)
    const [departments, setDepartments] = useState([])
    const [positions, setPositions] = useState([])
    const [formData, setFormData] = useState({ name: "", departmentId: "" })
    const [loading, setLoading] = useState(false)

    // Fetch departments and positions on mount
    useEffect(() => {
        fetchDepartments()
        fetchPositions()
    }, [])

    const fetchDepartments = async () => {
        setLoading(true)

            const res = await getDepartments()
            if (res.success) setDepartments(res.departments)
        setLoading(false)
    }

    const fetchPositions = async () => {
        setLoading(true)
        const res = await getPositions()
        console.log(res)
        if (res.success) setPositions(res.positions)
        setLoading(false)
    }

    const getDepartmentName = (departmentId) => {
        const dept = departments.find((dept) => dept.id === departmentId)
        return dept ? dept.name : "Unknown"
    }

    const handleOpenModal = (mode, item) => {
        setModalMode(mode)
        setEditingItem(item || null)
        if (mode === "edit" && item) {
            if ("departmentId" in item) {
                setFormData({
                    name: item.name,
                    departmentId: item.departmentId?.toString() || "",
                })
            } else {
                setFormData({
                    name: item.name,
                    departmentId: "",
                })
            }
        } else {
            setFormData({
                name: "",
                departmentId: "",
            })
        }
        setIsModalOpen(true)
    }

    const handleSave = async () => {
        setLoading(true)
        if (activeTab === "departments") {
            if (modalMode === "add") {
                const res = await createDepartment(formData.name)
                if (res.success) {
                    setDepartments([...departments, res.department])
                    toast("Successful", {
                        description: "Success creating an department!",
                    })
                }
            } else if (editingItem) {
                const res = await updateDepartment(editingItem.id, formData.name)
                if (res.success) {
                    setDepartments(departments.map((dept) =>
                        dept.id === editingItem.id ? res.department : dept
                    ))
                    toast("Successful", {
                        description: "Success updating an department!",
                    })
                }
            }
        } else {
            if (modalMode === "add") {
                const res = await createPosition(formData.name)
                if (res.success) {
                    setPositions([...positions, res.position])
                    toast("Successful", {
                        description: "Success creating an position!",
                    })
                }
            } else if (editingItem) {
                const res = await updatePosition(editingItem.id, formData.name)
                if (res.success) {
                    setPositions(positions.map((pos) =>
                        pos.id === editingItem.id ? res.position : pos
                    ))
                    toast("Successful", {
                        description: "Success updating an position!",
                    })
                }
            }
        }
        setIsModalOpen(false)
        setEditingItem(null)
        setLoading(false)
    }

    const handleDelete = async (id) => {
        setLoading(true)
        if (activeTab === "departments") {
            const res = await deleteDepartment(id)
            if (res.success) {
                setDepartments(departments.filter((dept) => dept.id !== id))
                setPositions(positions.filter((pos) => pos.departmentId !== id))
                toast("Successful", {
                    description: "Success deleting an department!",
                })
            }
        } else {
            const res = await deletePosition(id)
            if (res.success) {
                toast("Successful", {
                    description: "Success deleting an position!",
                })
                setPositions(positions.filter((pos) => pos.id !== id))
            }
        }
        setLoading(false)
    }

    return (
        <Card className="">
            <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                    Departments & Positions Management
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenModal("add")} className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Add {activeTab === "departments" ? "Department" : "Position"}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="text-white ">
                            <DialogHeader>
                                <DialogTitle>
                                    {modalMode === "add" ? "Add" : "Edit"} {activeTab === "departments" ? "Department" : "Position"}
                                </DialogTitle>
                                <DialogDescription className="text-gray-400">
                                    {modalMode === "add" ? "Create a new" : "Update the"}{" "}
                                    {activeTab === "departments" ? "department" : "position"} information.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                {activeTab === "departments" ? (
                                    <div className="space-y-2">
                                        <Label htmlFor="dept-name">Department Name</Label>
                                        <Input
                                            id="dept-name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="text-white bg-gray-900 border-gray-600"
                                            placeholder="Enter department name"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="pos-name">Position Name</Label>
                                            <Input
                                                id="pos-name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="text-white bg-gray-900 border-gray-600"
                                                placeholder="Enter position name"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                    {modalMode === "add" ? "Create" : "Update"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)}>
                    <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                        <TabsTrigger value="departments" className="data-[state=active]:bg-gray-600 text-white">
                            Departments ({departments.length})
                        </TabsTrigger>
                        <TabsTrigger value="positions" className="data-[state=active]:bg-gray-600 text-white">
                            Positions ({positions.length})
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="departments" className="mt-4">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-gray-700">
                                    <TableHead className="text-gray-300">Department Name</TableHead>
                                    <TableHead className="text-right text-gray-300">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {departments.map((department) => (
                                    <TableRow key={department.id} className="border-gray-700">
                                        <TableCell className="font-medium text-white">{department.name}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleOpenModal("edit", department)}
                                                    className="border-gray-600 hover:bg-gray-700"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDelete(department.id)}
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                    <TabsContent value="positions" className="mt-4">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-gray-700">
                                    <TableHead className="text-gray-300">Position Name</TableHead>
                                    <TableHead className="text-right text-gray-300">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {positions.map((position) => (
                                    <TableRow key={position.id} className="border-gray-700">
                                        <TableCell className="font-medium text-white">{position.name}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleOpenModal("edit", position)}
                                                    className="border-gray-600 hover:bg-gray-700"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDelete(position.id)}
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}